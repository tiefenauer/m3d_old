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
        expect(profile.mesh).not.toBe(null);
        expect(profile.name).not.toBe(null);
        expect(profile.name.length).toBeGreaterThan(0);
        expect(profile.mesh.name).not.toBe(null);
        expect(profile.name).toEqual(profile.mesh.name);
        expect(profile.segmentsX).toBe(2);
        expect(profile.segmentsY).toBe(2);
        expect(profile.segmentsZ).toBe(0);

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


      it('should calculate the dimensions correctly', function(){
        var profile = new Profile({profilePoints: orderedPoints});
        expect(profile.getDimensionX()).toBeGreaterThan(0);
        expect(profile.getDimensionY()).toBeGreaterThan(0);
        expect(profile.getDimensionZ()).toBeGreaterThan(0);
      });

      it('should create a valid mesh from profilePoints', function(){
        var profile = new Profile({profilePoints: orderedPoints});
        expect(profile.mesh).not.toBe(null);
        expect(profile.mesh.geometry.vertices.length).toEqual(orderedPoints.length * 2);      

        var minElv = profile.getMinElv();
        _.forEach(orderedPoints, function(point, i){
          // die Y-Koordinate wird normalisiert berechnet, d.h. der tiefste Punkt auf der Karte wird nicht angehoben
          var expectedElevation = profile.thickness / 2 + point.elv - minElv;
          expect(profile.mesh.geometry.vertices[i].y).toBeCloseTo(expectedElevation);
        });        
      });

      it('should calculate the correct value of the bottom index', function(){
        var profile = new Profile({profilePoints: orderedPoints});
        _.forEach(orderedPoints, function(point, i){
          expect(profile.getBottomIndex(i)).toBeGreaterThan(8);
          expect(profile.getBottomIndex(i)).toBeLessThan(18);
        });
      });

      it('should return the correct vertex for a vertex on top', function(){
        // negative tests
        // --------------
        // no mesh
        var profile = new Profile();
        expect(profile.getBottomVertex(orderedPoints[0])).toBe(null);

        profile = new Profile({profilePoints: orderedPoints});        
        // no vertex
        expect(profile.getBottomVertex(null)).toBe(null);
        // no vertex within mesh
        expect(profile.getBottomVertex(new THREE.Vector3(9,9,9))).toBe(null);
        // no top vertex
        for (var i=Math.ceil(profile.mesh.geometry.vertices.length / 2); i<profile.mesh.geometry.vertices.length; i++){
          var bottomVertex = profile.mesh.geometry.vertices[i];
          expect(profile.getBottomVertex(bottomVertex)).toBe(null);
        }   

        // positive tests
        // --------------
        for(var i=0; i<Math.ceil(profile.mesh.geometry.vertices.length / 2); i++){
          var topVertex = profile.mesh.geometry.vertices[i];
          var bottomVertex = profile.getBottomVertex(topVertex);
          expect(bottomVertex).not.toBe(null);
          expect(bottomVertex instanceof THREE.Vector3).toBe(true);
          expect(_.find(profile.mesh.geometry.vertices, bottomVertex)).toBeDefined();
        }
      });

      it('should calculate a correct inverted model', function(){
        var profile = new Profile({profilePoints: orderedPoints});
        var mold = profile.getMold();
        expect(mold).not.toBe(null);
        expect(mold instanceof THREE.Mesh).toBe(true);
      });

    });

});