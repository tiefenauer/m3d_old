// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',
	
	plugins: [
		'karma-htmlfile-reporter', 'karma-jasmine', 'karma-requirejs', 'karma-coverage', 'karma-phantomjs-launcher'
	],		

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      {pattern: 'bower_components/angular/angular.js', included: false },
      {pattern: 'bower_components/angular-mocks/angular-mocks.js', included: false },
      {pattern: 'bower_components/angular-resource/angular-resource.js', included: false },
      {pattern: 'bower_components/angular-cookies/angular-cookies.js', included: false },
      {pattern: 'bower_components/angular-sanitize/angular-sanitize.js', included: false },
      {pattern: 'bower_components/angular-route/angular-route.js', included: false },
      {pattern: 'bower_components/angular-animate/angular-animate.js', included: false },
      {pattern: 'bower_components/angular-touch/angular-touch.js', included: false },
      {pattern: 'app/scripts/*.js', included: false },
      {pattern: 'app/scripts/**/*.js', included: false },
      {pattern: 'test/spec/**/*.js', included: false },
      {pattern: 'bower_components/**/*.js', included: false},
      // http://karma-runner.github.io/0.10/plus/requirejs.html
      'test/test-main.js'
    ],

    // list of files / patterns to exclude
    exclude: [
        'app/scripts/main.js'
    ],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    reporters: ['progress', 'coverage', 'html'],

    preprocessors: {
      'app/scripts/**/*.js': ['coverage']
    },

    htmlReporter: {
      outputFile: 'reports/tests/unit/index.html'
    },

    coverageReporter: {
      dir: 'reports/coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html'}
        ,{ type: 'lcov', subdir: 'report-lcov'}
        ,{ type: 'cobertura', subdir: '.', file: 'cobertura.txt' }
        ,{ type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' }
        ,{ type: 'teamcity', subdir: '.', file: 'teamcity.txt' }
        ,{ type: 'text', subdir: '.', file: 'text.txt' }
        ,{ type: 'text-summary', subdir: '.', file: 'text-summary.txt' }
      ]
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
