define([
  'angular'
  ], 
  function (angular) {
    'use strict';

    var MapDirective = function(){
        return {
          templateUrl: 'views/templates/map.html',
          restrict: 'E',
          controller: 'MapCtrl'
        };      
    };

    return MapDirective;

    /**
     * @ngdoc directive
     * @name m3dApp.directive:m3dMap
     * @description
     * # m3dMap
     */
     /*
    angular.module('m3d.directives.M3dmap', [])
      .directive('m3dMap', function () {
        return {
          templateUrl: 'views/templates/map.html',
          restrict: 'E',
          controller: 'MapCtrl'
        };
      });
  */
});
