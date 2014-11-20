/*jshint unused: vars */
define([
   'angular'
  ,'angular-mocks'
  ,'app'
  ], 
  function(angular, mocks, app) {
  'use strict';

  describe('Service: ProfileIOService', function () {

    // load the service's module
    beforeEach(module('m3d.services'));

    // instantiate service
    var ProfileIOService;
    beforeEach(inject(function (_ProfileIOService_) {
      ProfileIOService = _ProfileIOService_;
    }));

    it('should do something', function () {
      expect(!!ProfileIOService).toBe(true);
    });

  });
});
