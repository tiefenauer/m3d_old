'use strict'
define([
  'angular'
  ,'angular-mocks'
  ,'app'
  ,'lodash'
  ,'models/m3dProfile'
  ,'models/m3dProfilePoint'
  ,'threejs'
  ,'services/profileOutline'
  ,'vendor/three/ThreeCSG'
  ], 
  function(angular, mocks, app, _, Profile, ProfilePoint, THREE, ProfileOutlineService){

    describe('Service: ProfileOutlineService', function(){

      beforeEach(module('m3d.services'));
      // instantiate service
      var outlineService, rootScope;
      beforeEach(inject(function (_ProfileOutlineService_, $injector) {
        outlineService = _ProfileOutlineService_;
        rootScope = $injector.get('$rootScope');
      }));    

     /* Dummy Profile points for a 3x3 square ranging from 0/0 (bottom left) to 2/2 (top right) 
      * with different elevation values.
      * The points ar not ordered, this should be done in the Profile!
      */
      var orderedPoints = [
         new ProfilePoint({lat: 0, lng: 0, elv: 1})
        ,new ProfilePoint({lat: 0, lng: 1, elv: 2})
        ,new ProfilePoint({lat: 0, lng: 2, elv: 3})
        ,new ProfilePoint({lat: 1, lng: 0, elv: 4})
        ,new ProfilePoint({lat: 1, lng: 1, elv: 5})
        ,new ProfilePoint({lat: 1, lng: 2, elv: 6})
        ,new ProfilePoint({lat: 2, lng: 0, elv: 7})
        ,new ProfilePoint({lat: 2, lng: 1, elv: 8})
        ,new ProfilePoint({lat: 2, lng: 2, elv: 9})
      ];
      // Same list, but shuffled
      var shuffledPoints = _.shuffle(orderedPoints);

      var boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true }));
      it('should be a valid ProfileOutlineService object', function () {
        expect(!!outlineService).toBe(true);
        expect(typeof(outlineService)).toBe('object');
      });

      it('should calculate a correct inverted model', function(){
        var profile = new Profile({profilePoints: orderedPoints});
        var mold = outlineService.invert(profile);
        expect(mold).not.toBe(null);
        expect(mold instanceof THREE.Mesh).toBe(true);
      });


    });
});