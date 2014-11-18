var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    // Removed "Spec" naming from files
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/app/scripts',

    paths: {
    angular: '../../bower_components/angular/angular',
    'angular-animate': '../../bower_components/angular-animate/angular-animate',
    'angular-cookies': '../../bower_components/angular-cookies/angular-cookies',
    'angular-mocks': '../../bower_components/angular-mocks/angular-mocks',
    'angular-resource': '../../bower_components/angular-resource/angular-resource',
    'angular-route': '../../bower_components/angular-route/angular-route',
    'angular-sanitize': '../../bower_components/angular-sanitize/angular-sanitize',
    'angular-scenario': '../../bower_components/angular-scenario/angular-scenario',
    'angular-touch': '../../bower_components/angular-touch/angular-touch',
    bootstrap: '../../bower_components/bootstrap/dist/js/bootstrap',
    threejs: '../../bower_components/threejs/build/three',
    bluebird: '../../bower_components/bluebird/js/browser/bluebird',
    lodash: '../../bower_components/lodash/dist/lodash.compat',
    text: '../../bower_components/text/text',
    'ladda-bootstrap': '../../bower_components/ladda-bootstrap/dist/ladda',
    spin: '../../bower_components/ladda-bootstrap/dist/spin',
    jquery: '../../bower_components/jquery/dist/jquery',
    async: '../../bower_components/requirejs-plugins/src/async',
    depend: '../../bower_components/requirejs-plugins/src/depend',
    font: '../../bower_components/requirejs-plugins/src/font',
    goog: '../../bower_components/requirejs-plugins/src/goog',
    image: '../../bower_components/requirejs-plugins/src/image',
    json: '../../bower_components/requirejs-plugins/src/json',
    mdown: '../../bower_components/requirejs-plugins/src/mdown',
    noext: '../../bower_components/requirejs-plugins/src/noext',
    propertyParser: '../../bower_components/requirejs-plugins/src/propertyParser',
    'threejs-OrbitControls': '../../bower_components/threejs-controls/controls/OrbitControls',
    'Markdown.Converter': '../../bower_components/requirejs-plugins/lib/Markdown.Converter'
  },

    shim: {
        'angular' : {
            'exports' : 'angular',
            deps: [
                'bootstrap',
                'threejs',
                'lodash',
                'gmaps'
            ]},
        'angular-route': ['angular'],
        'angular-cookies': ['angular'],
        'angular-sanitize': ['angular'],
        'angular-resource': ['angular'],
        'angular-animate': ['angular'],
        'angular-touch': ['angular'],
        'angular-mocks': {
          deps:['angular'],
          'exports':'angular.mock'
        },
        bootstrap: [
          'jquery'
        ],
        threejs: {
          exports: 'THREE'
        }        
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
