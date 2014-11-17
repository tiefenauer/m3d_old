/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Controller: MapCtrl', function () {

    // load the controller's module
    beforeEach(module('m3dApp.controllers.MapCtrl'));

    var MapCtrl,
      scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      MapCtrl = $controller('MapCtrl', {
        $scope: scope
      });
    }));

/*
    it('should attach a list of awesomeThings to the scope', function () {
      expect(scope.awesomeThings.length).toBe(3);
    });
  */
  });
});
