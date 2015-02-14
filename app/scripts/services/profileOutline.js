'use strict'
define([
   'angular'
  ,'threejs'  
  ,'lodash'
  ,'models/m3dProfile'
  ],
  function(angular, THREE, _, Profile){

    var $log, $rootScope;
    /**
     * ProfileOutlineService
     * Service to load and save files from/to file
     * @class
     * @name m3d.services.ProfileOutlineService 
     * @constructor
     * @namespace
     */
    var ProfileOutlineService = function($log, $rootScope){
      this.init($log, $rootScope);
    };

    ProfileOutlineService.prototype = /** @lends m3d.services.ProfileOutlineService.prototype */{
      extrudeSettings: { 
        amount: 40, 
        bevelEnabled: true, 
        bevelSegments: 2, 
        steps: 2, 
        bevelSize: 1, 
        bevelThickness: 1 
      },

      init: function(log, rootScope){
        $log = log;
        $rootScope = rootScope;
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
        var mesh = this.extrude(shape, this.extrudeSettings, posX, 0, posY);        
        return mesh;
      },

      extrude: function(shape, extrudeSettings, x, y, z){
        //var points = shape.createPointsGeometry();
        //var spacedPoints = shape.createSpacedPointsGeometry(50);
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

    return ['$log', '$rootScope', ProfileOutlineService];
});