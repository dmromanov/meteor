Package.describe({
  summary: "Tiny testing framework",
  version: '1.1.0-beta161.12'
});

Package.onUse(function (api) {
  api.use([
    'ecmascript',
    'ejson',
    'underscore',
    'random',
    'ddp',
    'mongo',
    'check'
  ]);

  api.mainModule('tinytest_client.js', 'client');
  api.mainModule('tinytest_server.js', 'server');

  api.export('Tinytest');
});
