define([
  'angular'
  ], 
  function (angular) {
    'use strict';

    var ProfileDirective = function () {
      return {
        templateUrl: 'views/templates/profile.html',
        restrict: 'E',
        controller: 'ProfileCtrl'
      };
    };

    return ProfileDirective;

  /**
   * @ngdoc directive
   * @name m3dApp.directive:m3dProfile
   * @description
   * # m3dProfile
   */
   /*
  angular.module('m3dApp.directives.M3dprofile', [])
    .directive('m3dProfile', ProfileDirective);
    */
});
