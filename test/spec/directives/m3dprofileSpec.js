/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Directive: m3dProfile', function () {

    // load the directive's module
    beforeEach(module('m3dApp.directives.M3dprofile'));

    var element,
      scope;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function ($compile) {
      element = angular.element('<m3d-profile></m3d-profile>');
      element = $compile(element)(scope);
      //expect(element.text()).toBe('this is the m3dProfile directive');
    }));
  });
});
