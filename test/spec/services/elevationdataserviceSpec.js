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
      var ElevationDataService, rootScope;

      var createDummyCoordinates = function(num){
        var result = [];
        for (var i=0; i<num; i++){
          result[i] = {
            lat: Math.floor(Math.random(0,180)*100), 
            lng: Math.floor(Math.random(0,180)*100)
          };
        }
        return result;
      };

      var createDummyReponses = function(dummyCoordinates){
        var result = [];
        $.each(dummyCoordinates, function(i, coord){
          result[i] = {
            location: {
              lat: function(){return coord.lat},
              lng: function(){return coord.lng}
            },
            elevation: 43
          };
        });
        return result;
      };

      var originalTimeout ;

      beforeEach(inject(function (_ElevationDataService_, $injector) {
        ElevationDataService = _ElevationDataService_;
        rootScope = $injector.get('$rootScope');

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      }));

      afterEach(function(){
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      });

      it('should be a valid ElevationDataService object', function () {
        expect(!!ElevationDataService).toBe(true);
        expect(ElevationDataService.getElevationData).not.toBe(null);
        expect(typeof(ElevationDataService.getElevationData)).toBe('function');
      });

      it('should work with empty array', function(){
        spyOn(rootScope, '$broadcast');       
        var footprint = {
          getProfilePoints: function(){return []},
          setProfilePoints: function(value){}
        } 
        ElevationDataService.getElevationData(footprint);

        expect(rootScope.$broadcast).toHaveBeenCalled();
        expect(rootScope.$broadcast.calls.first().args[0]).toBe('adapter:start');
        expect(rootScope.$broadcast.calls.first().args[1].numItems).toBe(0);
        expect(rootScope.$broadcast.calls.first().args[1].numCalls).toBe(0);
        expect(rootScope.$broadcast.calls.mostRecent().args[0]).toBe('adapter:end');
      });

      it('should trigger status events when processing', function(done){
        var footprint = {
          profilePoints: createDummyCoordinates(2500),
          getProfilePoints: function(){
            return this.profilePoints;
          },
          setProfilePoints: function(value){
            this.profilePoints = value;
          }
        };
        var dummyGoogleMapsFunction = function(queueItem, callback){
          setTimeout(function(){
            var result = createDummyReponses(queueItem.locations);
            callback(result, google.maps.ElevationStatus.OK);
          },1);
        };
        var itemProgressCount = 0;
        var queueProgressCount = 0;
        rootScope.$on('adapter:item:progress', function(event, args){ itemProgressCount++ });
        rootScope.$on('adapter:queue:progress', function(event, args){ queueProgressCount++ });
        rootScope.$on('adapter:end', function(event, footprint){
          expect(itemProgressCount).toBe(2500);
          expect(queueProgressCount).toBe(Math.ceil(2500/ElevationDataService.CHUNK_SIZE));
          var profilePoints = footprint.getProfilePoints();
          profilePoints.forEach(function(entry, index){
            expect(entry.elv).toBe(43);
          });
          done();
        });
        spyOn(rootScope, '$broadcast').and.callThrough();
        spyOn(google.maps.ElevationService.prototype, 'getElevationForLocations').and.callFake(dummyGoogleMapsFunction);
        ElevationDataService.getElevationData(footprint);

        // start event
        expect(rootScope.$broadcast).toHaveBeenCalled();
        expect(rootScope.$broadcast.calls.first().args[0]).toBe('adapter:start');
        expect(rootScope.$broadcast.calls.first().args[1].numItems).toBe(2500);
        expect(rootScope.$broadcast.calls.first().args[1].numCalls).toBe(Math.ceil(2500/ElevationDataService.CHUNK_SIZE));
      });

  });
});
