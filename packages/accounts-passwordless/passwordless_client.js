import { Tracker } from 'meteor/tracker';

// Used in the various functions below to handle errors consistently
const reportError = (error, callback) => {
  if (callback) {
    callback(error);
  } else {
    throw error;
  }
};

const transformSelector = selector => {
  if (typeof selector !== 'string') {
    return selector;
  }

  if (selector.includes('@')) {
    return { email: selector };
  }

  return { username: selector };
};

// Attempt to log in with a token.
//
// @param selector {String|Object} One of the following:
//   - {username: (username)}
//   - {email: (email)}
//   - a string which may be a username or email, depending on whether
//     it contains "@".
// @param password {String}
// @param callback {Function(error|undefined)}

/**
 * @summary Log the user in with a one time token.
 * @locus Client
 * @param {Object} selector
 * @param {String} token one time token generated by the server
 * @param {Function} [callback] Optional callback.
 *   Called with no arguments on success, or with a single `Error` argument
 *   on failure.
 * @importFromPackage meteor
 */
Meteor.loginWithToken = (selector, token, callback) => {
  Accounts.callLoginMethod({
    methodArguments: [
      {
        selector: transformSelector(selector),
        token,
      },
    ],
    userCallback: error => {
      if (error) {
        reportError(error, callback);
      } else {
        callback && callback();
      }
    },
  });
};

/**
 * @summary Request a login token.
 * @locus Client
 * @param selector
 * @param userData
 * @param {Object} options
 * @param {String} options.selector The email address to get a token for or username or a mongo selector.
 * @param {String} options.userData When creating an user use this data if selector produces no result
 * @param {String} options.options. For example userCreationDisabled.
 * @param {Function} [callback] Optional callback. Called with no arguments on success, or with a single `Error` argument on failure.
 */
Accounts.requestLoginTokenForUser = (
  { selector, userData, options },
  callback
) => {
  if (!selector) {
    return reportError(new Meteor.Error(400, 'Must pass selector'), callback);
  }

  Accounts.connection.call(
    'requestLoginTokenForUser',
    { selector: transformSelector(selector), userData, options },
    callback
  );
};

const checkToken = ({ selector, token }) => {
  if (!token) {
    return;
  }

  const userId = Tracker.nonreactive(Meteor.userId);

  if (!userId) {
    Meteor.loginWithToken(selector, token, () => {
      // Make it look clean by removing the authToken from the URL
      if (window.history) {
        const url = window.location.href.split('?')[0];

        window.history.pushState(null, null, url);
      }
    });
  }
};
/**
 * Parse querystring for token argument, if found use it to auto-login
 */
Accounts.autoLoginWithToken = function() {
  Meteor.startup(function() {
    const params = new URL(window.location.href).searchParams;

    if (params.get('loginToken')) {
      const rawSelector = params.get('selector');
      checkToken({
        selector: rawSelector.startsWith('{')
          ? JSON.parse(rawSelector)
          : rawSelector,
        token: params.get('loginToken'),
      });
    }
  });
};

// Run check for login token on page load
document.addEventListener('DOMContentLoaded', () => Accounts.autoLoginWithToken())
