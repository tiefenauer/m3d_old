/*jshint unused: vars */
define([
  'angular'
  ,'angular-mocks'
  ,'app'
  ], function(angular, mocks, app) {
    'use strict';

    describe('Decorator: LogDecorator', function () {

      // load the service's module
      beforeEach(module('m3d.decorators'));

      // instantiate service
      var log;

      beforeEach(inject(function ($log, $injector) {
        log = $log;
      }));

      afterEach(function(){
      });

      it('should be a valid Logger object', function () {
        expect(!!log).toBe(true);
        });

      xit('ignored tests', function(){
        expect(true).toBe(true);
      });


  });
});
