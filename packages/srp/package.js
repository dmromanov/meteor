// XXX COMPAT WITH 0.8.3
// This package is replaced by the use of bcrypt in accounts-password,
// but we are leaving in some of the code to allow existing user
// databases to be upgraded from SRP to bcrypt.

Package.describe({
  summary: "Library for Secure Remote Password (SRP) exchanges",
  version: "1.1.0-beta1102.1"
});

Package.onUse(function (api) {
  api.use([
    'ecmascript',
    'random',
    'check',
    'sha'
  ], ['client', 'server']);
  api.export('SRP');
  api.mainModule('srp.js');
});

Package.onTest(function (api) {
  api.use(['ecmascript', 'tinytest']);
  api.use('srp', ['client', 'server']);
  api.addFiles(['srp_tests.js'], ['client', 'server']);
});
