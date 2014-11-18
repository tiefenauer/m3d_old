/*jshint unused: vars */
define([
  'angular'
  ,'angular-mocks'
  ,'app'
  ], function(angular, mocks, app) {
    'use strict';

    describe('Service: ElevationDataService', function () {

      // load the service's module
      beforeEach(module('m3d.services'));

      // instantiate service
      var ElevationDataService;
      beforeEach(inject(function (_ElevationDataService_) {
        ElevationDataService = _ElevationDataService_;
      }));

      it('should not be empty', function () {
        expect(!!ElevationDataService).toBe(true);
      });

  });
});
