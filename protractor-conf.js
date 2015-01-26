var ScreenShotReporter = require('protractor-screenshot-reporter');
var HtmlReporter = require('protractor-html-screenshot-reporter');
var path = require('path');

exports.config = {
  onPrepare: function() {
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new HtmlReporter({
         baseDirectory: 'tests/e2e',
         pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
            return path.join(descriptions.join('-'));
         }
      })
      /*
      new ScreenShotReporter({
         baseDirectory: 'tests/e2e',
         pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
            return path.join(descriptions.join('-'));
         }
      })
      */
    );
  },

  allScriptsTimeout: 11000,

  specs: [
    'test/e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  directConnect: true,

  baseUrl: 'http://localhost:8000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
