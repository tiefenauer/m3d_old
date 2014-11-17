define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc directive
   * @name m3dApp.directive:m3dProfile
   * @description
   * # m3dProfile
   */
  angular.module('m3dApp.directives.M3dprofile', [])
    .directive('m3dProfile', function () {
      return {
        templateUrl: 'views/templates/profile.html',
        restrict: 'E',
        controller: 'ProfileCtrl'
      };
    });
});
