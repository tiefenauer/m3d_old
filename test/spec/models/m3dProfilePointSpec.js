define([
   'angular'
  ,'angular-mocks'
  ,'models/m3dProfilePoint'
  ],
  function(angular, mocks, ProfilePoint){

    describe('Model: ProfilePoint', function(){

      it('should initialize with correct default values', function(){
        var point = new ProfilePoint();
        expect(point).not.toBe(null);
        expect(typeof point).toBe('object');
        expect(point instanceof ProfilePoint).toBe(true);
        expect(point.lat).toEqual(0);
        expect(point.lng).toEqual(0);
        expect(point.elv).toEqual(0);
      });

      it('should initialize with options object', function(){
        // all values
        var point = new ProfilePoint({ lat: 1, lng: 2, elv:3 });
        expect(point.lat).toBe(1);
        expect(point.lng).toBe(2);
        expect(point.elv).toBe(3);

        // no elv
        var point = new ProfilePoint({ lat: 1, lng: 2 });
        expect(point.lat).toBe(1);
        expect(point.lng).toBe(2);
        expect(point.elv).toBe(0);

        // no lng
        var point = new ProfilePoint({ lat: 1, elv:3 });
        expect(point.lat).toBe(1);
        expect(point.lng).toBe(0);
        expect(point.elv).toBe(3);

        // no lat
        var point = new ProfilePoint({ lng: 2, elv:3 });
        expect(point.lat).toBe(0);
        expect(point.lng).toBe(2);
        expect(point.elv).toBe(3);
      });
    });
});