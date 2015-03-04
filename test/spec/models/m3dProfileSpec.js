define([
	'angular'
	,'angular-mocks'
	,'app'
  ,'lodash'
	,'models/m3dProfile'
  ,'models/m3dProfilePoint'
  ,'threejs'
  ,'vendor/three/ThreeCSG'
  ], 
	function(angular, mocks, app, _, Profile, ProfilePoint, THREE){

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

    describe('Model: Profile', function(){


      it('should initialize with correct default values', function(){
        var profile = new Profile();
        expect(profile).not.toBe(null);
        expect(typeof profile).toBe('object');
        expect(profile instanceof Profile).toBe(true);
        expect(profile.name).not.toBe(null);
        expect(profile.profilePoints).toEqual([]);
        expect(profile.mesh).toBe(null);
      });

      it('should initialize with correct values', function(){
        var profile = new Profile({
          profilePoints: shuffledPoints
        });
        expect(profile.profilePoints).toEqual(orderedPoints);
        expect(profile.name).not.toBe(null);
        expect(profile.name.length).toBeGreaterThan(0);

        profile = new Profile({
          mesh: boxMesh 
        });
        expect(profile.profilePoints).toEqual([]);
        expect(profile.mesh).toEqual(boxMesh);
      });

      it('should calculate the max/min-values correctly', function(){
        var profile = new Profile({profilePoints: orderedPoints});
        expect(profile.getMaxLat()).toBe(2);
        expect(profile.getMinLat()).toBe(0);
        expect(profile.getMaxLng()).toBe(2);
        expect(profile.getMinLng()).toBe(0);
        expect(profile.getMaxElv()).toBe(9);
        expect(profile.getMinElv()).toBe(1);
      });

    });

});