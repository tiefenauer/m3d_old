/*jshint unused: vars */
require.config({
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
    lodash: '../../bower_components/lodash/lodash.min',
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
    'Markdown.Converter': '../../bower_components/requirejs-plugins/lib/Markdown.Converter',
    'angular-bootstrap': '../../bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'jquery-ui': '../../bower_components/jquery-ui/jquery-ui',
    'angular-google-maps': '../../bower_components/angular-google-maps/dist/angular-google-maps'
  },
  shim: {
    angular: {
      exports: 'angular',
      deps: [
        'bootstrap',
        'threejs',
        'lodash',
        'gmaps'
      ]
    },
    'angular-route': [
      'angular'
    ],
    'angular-cookies': [
      'angular'
    ],
    'angular-sanitize': [
      'angular'
    ],
    'angular-resource': [
      'angular'
    ],
    'angular-animate': [
      'angular'
    ],
    'angular-touch': [
      'angular'
    ],
    'angular-bootstrap': [
      'angular'
    ],
    'angular-google-maps': [
      'angular'
    ],
    'angular-mocks': {
      deps: [
        'angular'
      ],
      exports: 'angular.mock'
    },
    bootstrap: [
      'jquery'
    ],
    threejs: {
      exports: 'THREE'
    },
    app: [
      'angular',
      'angular-route',
      'angular-cookies',
      'angular-sanitize',
      'angular-resource',
      'angular-animate',
      'angular-touch',
      'angular-bootstrap'
    ],
    'vendor/three/ThreeCSG': ['threejs', 'vendor/three/csg']
  },
  packages: [

  ]
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
//window.name = 'NG_DEFER_BOOTSTRAP!';
require(['app'], function(){
  angular.bootstrap(document, ['m3d'])
});
/*
require(['app'
  'angular',
  'app',
  'angular-route',
  'angular-cookies',
  'angular-sanitize',
  'angular-resource',
  'angular-animate',
  'angular-touch',
  'angular-bootstrap'
], function(angular, app, ngRoutes, ngCookies, ngSanitize, ngResource, ngAnimate, ngTouch) {
  'use strict';
  /* jshint ignore:start */
  //var $html = angular.element(document.getElementsByTagName('html')[0]);
  /* jshint ignore:end */
  /*
  angular.element().ready(function() {
    angular.resumeBootstrap();
  });  
});
*/
