'use strict'

define([], 
  function () {
  

  var MenuDirective = function () {
    return {
      templateUrl: 'views/templates/menu.html',
      restrict: 'E',
      controller: 'MenuCtrl'
    };
  };

  return MenuDirective;

});
