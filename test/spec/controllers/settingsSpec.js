/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Controller: SettingsCtrl', function () {

    // load the controller's module
    beforeEach(module('m3d.controllers'));

    var SettingsCtrl,
      scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      SettingsCtrl = $controller('SettingsCtrl', {
        $scope: scope
      });
    }));

/*
    it('should attach a list of awesomeThings to the scope', function () {
    });
*/
  });
});
