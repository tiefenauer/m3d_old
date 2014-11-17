/*jshint unused: vars */
define([
  'angular', 
  'directives/m3dmenu', 
  'controllers/menu'
  , 'directives/m3dmap'
  , 'controllers/map'
  , 'directives/m3dprofile'
  , 'controllers/profile'
  , 'services/elevationdataservice'
  , 'decorators/logdecorator']/*deps*/, 
  function (angular, M3dmenuDirective, MenuCtrl, M3dmapDirective, MapCtrl, M3dprofileDirective, ProfileCtrl, ElevationdataserviceService, LogDecorator)/*invoke*/ {
  'use strict';

  /**
   * @ngdoc overview
   * @name m3dApp
   * @description
   * # m3dApp
   *
   * Main module of the application.
   */
  return angular.module('m3dApp', [
          'm3dApp.services.Elevationdataservice',    
          'm3dApp.directives.M3dmenu',
          'm3dApp.controllers.MenuCtrl',
          'm3dApp.directives.M3dmap',
'm3dApp.controllers.MapCtrl',
'm3dApp.directives.M3dprofile',
'm3dApp.controllers.ProfileCtrl',
'm3dApp.decorators.Log',
/*angJSDeps*/
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'ngAnimate',
            'ngTouch'
          ]);
});
