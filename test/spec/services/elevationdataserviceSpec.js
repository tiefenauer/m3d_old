/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Service: ElevationDataService', function () {

    // load the service's module
    beforeEach(module('m3dApp.services.Elevationdataservice'));

    // instantiate service
    var Elevationdataservice;
    beforeEach(inject(function (_ElevationDataService_) {
      Elevationdataservice = _ElevationDataService_;
    }));

    it('should do something', function () {
      //expect(!!Elevationdataservice).toBe(true);
    });

  });
});
