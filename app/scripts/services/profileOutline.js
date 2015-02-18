'use strict'
define([
   'angular'
  ,'threejs'  
  ,'lodash'
  ,'models/m3dProfile'
  ,'models/m3dProfilePoint'
  ],
  function(angular, THREE, _, Profile, ProfilePoint){

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

      createPolygon: function(coordinates){
        $log.debug('creating outline for ' + coordinates.length + ' coordinates');            

        var maxLat = _.max(coordinates, 'lat').lat;
        var maxLng = _.max(coordinates, 'lng').lng;
        var minLat = _.min(coordinates, 'lat').lat;
        var minLng = _.min(coordinates, 'lng').lng;
        var scale = 50000;

        // Schritt 1: Shape aus Einzelpunkten konstruieren
        var shape = this.createShape(coordinates, scale);

        // Schritt 2: Aus 2D-Shape eine 3D-Geometrie erstellen
        var posX, posY=0;
        posX = (maxLng - minLng)*scale/2;
        posY = (maxLat - minLat)*-scale/2;        
        var extrudedMesh = this.extrude(shape, extrudeSettings, posX, 0, posY);

        // Schritt 3: Die 3D-Geometrie regelmässig rastern und die Rasterpunkte ermitteln (ohne Randpunkte)
        var rasterResult = this.rasterize(extrudedMesh);
        var rasterizedMesh = rasterResult.mesh;
        var rasterVertices = rasterResult.vertices;

        // Schritt 4: Die ermittelten Rasterpunkte durch die Punkte auf dem Shaperands ergänzen
        var rasterPoints = this.calculateRasterPoints(rasterVertices, shape);

        // Schritt 5: Die Komplette Liste an Rasterpunkten zurückrechnen  in Koordinaten (ProfilePoints)
        var profilePoints = this.calculateProfilePoints(rasterPoints);

        // Mesh und Koordinaten zurückgeben
        return {
           mesh: rasterizedMesh
          ,profilePoints: profilePoints
        };
      },

      /**
      * Create Shape f
      * @param {m3d.models.ProfilePoint} coordinates list of coordinates to process
      * @returns {THREE.Shape} Shape representing the coordinates as a polygon
      */
      createShape: function(coordinates, scale){
        var maxLat = _.max(coordinates, 'lat').lat;
        var maxLng = _.max(coordinates, 'lng').lng;
        var minLat = _.min(coordinates, 'lat').lat;
        var minLng = _.min(coordinates, 'lng').lng;

        var shape = new THREE.Shape();
        _.forEach(coordinates, function(coordinate, i){
          var x = (coordinate.lat - maxLat) * scale;
          var y = (coordinate.lng - maxLng) * scale;
          shape.moveTo(x, y);
        });
        return shape;
      },

      /**
      * Calculates all raster points for a rasterized, but irregular polygon
      * @param {THREE.Mesh} mesh the rasterized mesh used to display the profile which contains all the vertices (but more than actually needed)
      * @param {THREE.Mesh} extrudedMesh the un-rasterized mesh 
      * @param {THREE.Shape} shape the shape used for extrusion
      */ 
      calculateRasterPoints: function(rasterizedMesh, extrudedMesh, shape){
        var rasterPoints = [];
        // Schritt 1: Alle Punkte auf dem Polygonrand gehören dazu
        var actions = _.filter(shape.actions, {'action': 'moveTo'});
        _.forEach(actions, function(action, n){
          var x = action.args[0];
          var y = action.args[1];
          //rasterPoints.push({x: x, y: y});
        });

        var isInExtrudedMesh = function(vertex){
          var found = false;
          for (var i=0; i<extrudedMesh.geometry.vertices.length && !found; i++){
            var v = extrudedMesh.geometry.vertices[i];
            if (v.x == vertex.x && v.y == vertex.y && v.z == vertex.z)
              found = true;
          }
          return found;
        };
        // Schritt 2: Alle Punkte des gerasterten Meshes, welche nicht auch im extrudierten Mesh vorkommen, gehören dazu
        rasterizedMesh.geometry.vertices.forEach(function(vertex){
          var inExtrudedMesh = isInExtrudedMesh(vertex);
          if (!inExtrudedMesh)
            rasterPoints.push({x: vertex.x, y: vertex.y});
        });

        return rasterPoints;
      },

      calculateProfilePoints: function(rasterPoints){

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

        // Rasterbox zum Rastern
        var boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth, 10, 1, 10);        
        var topVertices = this.getTopVertices(boxGeometry);

        var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true, wireframe: true });
        //return new THREE.Mesh(boxGeometry, material);

        var csgBox = new THREE.ThreeBSP(boxGeometry);
        var csgProfile = new THREE.ThreeBSP(extrudedMesh);
        var csgRasterized = csgBox.intersect(csgProfile);
        var geometry = csgRasterized.toGeometry();
        geometry.mergeVertices();

        // relevante Rasterpunkte ermitteln, für die Höhendaten ermittelt werden sollen
        // Diese ergeben sich aus denjenigen Vertices auf der Oberseite des Polygons, welche auch in der Rasterbox enthalten sind
        var topPolygonVertices = this.getCommonVertices(geometry.vertices, topVertices);
        
        var rasterizedMesh = new THREE.Mesh(geometry, material);
        return {
          mesh: rasterizedMesh,
          vertices: topPolygonVertices
        };
      },

      /**
      * Only for rectangular Get the index on the bottom for a vertex on top
      * @return {Number} the index of the vertex on the bottom
      */
      getTopVertices: function(boxGeometry){
        var topVertices = [];
        _.forEach(boxGeometry.vertices, function(vertex, n){
          var pair = _.filter(boxGeometry.vertices, {'x': vertex.x, 'z': vertex.z});
          var top = _.max(pair, 'y');
          var alreadyInList = _.filter(topVertices, {'x': top.x, 'z': top.z}).length > 0;
          // zweite Bedinggung wegen Genauigkeitsverlust
          if (!alreadyInList && top.y > 0)
            topVertices.push(top);
        });
        return topVertices;
      },

      /**
      * Get common vertices of two arrays
      */
      getCommonVertices: function(array1, array2){
        var result = [];
        var refArray = array1.length > array2.length?array2:array1;
        var otherArray = refArray == array1?array2:array1;

        _.forEach(refArray, function(vertex, n){
          filtered = _.filter(otherArray, {'x': vertex.x, 'z': vertex.z});
          result = result.concat(filtered);
        });
        return result;
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