define([
  'angular'
  ], 
  function (angular) {
  'use strict';

  var MenuDirective = function () {
    return {
      templateUrl: 'views/templates/menu.html',
      restrict: 'E',
      controller: 'MenuCtrl'
    };
  };

  return MenuDirective;
  /**
   * @ngdoc directive
   * @name m3dApp.directive:m3dMenu
   * @description
   * # m3dMenu
   */
   /*
  angular.module('m3dApp.directives.M3dmenu', [])
    .directive('m3dMenu', MenuDirective);
    */
});
