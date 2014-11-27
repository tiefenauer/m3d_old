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

});
