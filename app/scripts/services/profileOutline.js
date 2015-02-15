'use strict'
define([
   'angular'
  ,'threejs'  
  ,'lodash'
  ,'models/m3dProfile'
  ],
  function(angular, THREE, _, Profile){

    var extrudeSettings = { 
      amount: 40, 
      bevelEnabled: true, 
      bevelSegments: 2, 
      steps: 2, 
      bevelSize: 1, 
      bevelThickness: 1 
    };

    var $log;
    /**
     * ProfileOutlineService
     * Service to load and save files from/to file
     * @class
     * @name m3d.services.ProfileOutlineService 
     * @constructor
     * @namespace
     */
    var ProfileOutlineService = function(log){
      $log = log;
    };

    ProfileOutlineService.prototype = /** @lends m3d.services.ProfileOutlineService.prototype */{

      createProfile: function(profilePoints){
        var profile = new Profile({
          profilePoints: profilePoints,
          thickness: localStorage.getItem('thickness') || undefined
        });
        return profile;
      },

      createOutline: function(points){
        $log.debug('creating outline for ' + points.length + ' coordinates');            

        var maxLat = _.max(points, 'lat').lat;
        var maxLng = _.max(points, 'lng').lng;
        var minLat = _.min(points, 'lat').lat;
        var minLng = _.min(points, 'lng').lng;

        var scale = 50000;
        var shape = new THREE.Shape();
        _.forEach(points, function(point, i){
          var x = (point.lat-maxLat) * scale;
          var y = (point.lng-maxLng) * scale;
          shape.moveTo(x, y);
        });

        var posX, posY=0;
        posX = (maxLng - minLng)*scale/2;
        posY = (maxLat - minLat)*-scale/2;        
        var extrudedMesh = this.extrude(shape, extrudeSettings, posX, 0, posY);
        var mesh = this.rasterize(extrudedMesh);
        return mesh;
      },

      extrude: function(shape, extrudeSettings, x, y, z){
        var flatGeometry = new THREE.ShapeGeometry(shape);
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { color: 0x00ff00, ambient: 0x00ff00 } ));

        mesh.geometry.dynamic = true;

        var rotationX = new THREE.Matrix4().makeRotationX( Math.PI/2 );
        var rotationY = new THREE.Matrix4().makeRotationY( Math.PI/2 );

        mesh.updateMatrix();
        mesh.geometry.applyMatrix(mesh.matrix);
        mesh.geometry.applyMatrix(rotationX);
        mesh.geometry.applyMatrix(rotationY);
        mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(x,y,z));
        mesh.matrix.identity();

        return mesh;
      },

      rasterize: function(extrudedMesh){
        var maxX = _.max(extrudedMesh.geometry.vertices, 'x').x;
        var minX = _.min(extrudedMesh.geometry.vertices, 'x').x;
        var maxY = _.max(extrudedMesh.geometry.vertices, 'y').y;
        var minY = _.min(extrudedMesh.geometry.vertices, 'y').y;        
        var maxZ = _.max(extrudedMesh.geometry.vertices, 'z').z;
        var minZ = _.min(extrudedMesh.geometry.vertices, 'z').z;

        var boxWidth = maxX - minX;
        var boxHeight = (maxY - minY)/2;
        var boxDepth = maxZ - minZ;

        var boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth, 10, 1, 10);
        var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true, wireframe: false });
        //var boxMesh = new THREE.Mesh(boxGeometry, material);

        var csgBox = new THREE.ThreeBSP(boxGeometry);
        var csgProfile = new THREE.ThreeBSP(extrudedMesh);
        var csgRasterized = csgBox.intersect(csgProfile);
        var geometry = csgRasterized.toGeometry();
        
        var rasterized = new THREE.Mesh(geometry, material);
        return rasterized;
      },

      /**
      * create a mold by inverting the objects
      * @param {m3d.models.Profile} profile the profile to be inverted
      */
      invert: function(profile){
        profile.mesh.geometry.computeVertexNormals();
        // Quader für Gussform vorbereiten
        var boxBorderThickness = profile.getDimensionY() * 1.1 - profile.getDimensionY();
        var boxWidth = profile.getDimensionZ() + boxBorderThickness;
        var boxHeight = profile.getDimensionY() * 2 + boxBorderThickness;
        var boxDepth =  profile.getDimensionX() + boxBorderThickness;
        var boxGeometry = new THREE.BoxGeometry(boxDepth, boxHeight, boxWidth);
        boxGeometry.dynamic = true;
        // y-Position der unteren Vertices anpassen
        boxGeometry.vertices.forEach(function(vertex){
          if (vertex.y < 0)
            vertex.y = -1 * boxBorderThickness;
        });
        boxGeometry.verticesNeedUpdate = true;

        // Modell kopieren und Sockel erstellen
        profile.mesh.geometry.computeVertexNormals();
        var profileCopy = new Profile({
          profilePoints: profile.profilePoints,
          mesh: profile.mesh
        });   
        profile.mesh.geometry.computeVertexNormals();
        profileCopy.mesh.geometry.computeVertexNormals();

        profileCopy.mesh.dynamic = true;

        profile.mesh.geometry.computeVertexNormals();
        profileCopy.mesh.geometry.computeVertexNormals();

        // Sockel erstellen
        if (profileCopy.profilePoints.length > 0){
        _.forEach(profileCopy.profilePoints, function(point, i){
              var bottomIndex = profileCopy.getBottomIndex(i);                        
            profileCopy.mesh.geometry.vertices[bottomIndex].y = -1 * boxHeight;
            });   
        } 
        else{
          var half = Math.ceil(profileCopy.mesh.geometry.vertices.length / 2);
          var getBoti = function(n){        
            var side = Math.sqrt(half);       
            return half + n + side - 2*(n%side) - 1;
          }
          for(var i=0; i<half; i++){
            var boti = getBoti(i);
            profileCopy.mesh.geometry.vertices[boti].y = -1 * boxHeight;
          }
        };    
        //profileCopy.mesh = profile.mesh;
        profileCopy.mesh.geometry.verticesNeedUpdate = true;
        profileCopy.mesh.geometry.mergeVertices();
        profileCopy.mesh.geometry.computeVertexNormals();

        // Gussform aus Quader konstruieren          
        var csgBox = new THREE.ThreeBSP(boxGeometry);
        var csgProfile = new THREE.ThreeBSP(profileCopy.mesh);
        var csgMold = csgBox.subtract(csgProfile);
        var geometry = csgMold.toGeometry();

        var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true });
        var mold = new THREE.Mesh(geometry, material);

        // Gussform um 180° drehen
        var moldRotation = new THREE.Matrix4().makeRotationX( Math.PI );
        mold.updateMatrix();
        mold.geometry.applyMatrix(mold.matrix);
        mold.geometry.applyMatrix(moldRotation);
        mold.matrix.identity();
        mold.name = profile.mesh.name + 'mold';
        return mold;
      }

    };

    /**
    * only used for testing
    */
    var createCircle = function(){
      var circle = new THREE.Shape();
      var radius = 6;

      for (var i = 0; i < 16; i++) {
        var pct = (i + 1) / 16;
        var theta = pct * Math.PI * 2.0;
        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);
        if (i == 0) {
          circle.moveTo(x, y);
        } else {
          circle.lineTo(x, y);
        }
      }

      return circle.makeGeometry();
    };

    return ['$log', ProfileOutlineService];
});