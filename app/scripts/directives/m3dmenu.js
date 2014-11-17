define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name m3dApp.directive:m3dMenu
   * @description
   * # m3dMenu
   */
  angular.module('m3dApp.directives.M3dmenu', [])
    .directive('m3dMenu', function () {
      return {
        templateUrl: 'views/templates/menu.html',
        restrict: 'E',
        controller: 'MenuCtrl'
      };
    });
});
