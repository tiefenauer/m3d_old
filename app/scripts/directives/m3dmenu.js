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

});
