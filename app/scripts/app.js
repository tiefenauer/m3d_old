/*jshint unused: vars */
define([
  'angular'
  ,'filters'
  ,'services'
  ,'directives'
  ,'controllers'
  ,'models'
  ,'decorators'
  ,'routes'
  ]/*deps*/, 
  function (angular)/*invoke*/ {
  'use strict';


  /**  
   * Main module of the application.
   * @ngdoc overview
   * @name m3dApp
   * @description
   * # m3dApp
   */
  return angular.module('m3d', [
           'm3d.filters'
          ,'m3d.services'
          ,'m3d.directives'
          ,'m3d.controllers'
          ,'m3d.models'
          ,'m3d.decorators'
/*angJSDeps*/
          ,'ngCookies'
          ,'ngResource'
          ,'ngSanitize'
          ,'ngRoute'
          ,'ngAnimate'
          ,'ngTouch'
          ])
  .config(['$routeProvider', function($routeProvider){
      $routeProvider.when('gemeinden', {
        template: '<h1>hello</h1>'
      });
    }]);
});
