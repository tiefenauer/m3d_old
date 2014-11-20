/*jshint unused: vars */
define([
  'angular', 
  'angular-mocks', 
  'app'
  ], 
  function(angular, mocks, app) {
    'use strict';

    describe('Controller: MenuCtrl', function () {

      // load the controller's module
      beforeEach(module('m3d.controllers.MenuCtrl'));

      var MenuCtrl,
        scope;

      // Initialize the controller and a mock scope
      beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MenuCtrl = $controller('MenuCtrl', {
          $scope: scope
        });
      }));

    });
});
