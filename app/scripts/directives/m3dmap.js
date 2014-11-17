define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name m3dApp.directive:m3dMap
   * @description
   * # m3dMap
   */
  angular.module('m3dApp.directives.M3dmap', [])
    .directive('m3dMap', function () {
      return {
        templateUrl: 'views/templates/map.html',
        restrict: 'E',
        controller: 'MapCtrl'
      };
    });
});
