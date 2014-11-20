define([
  'angular'
  ,'jquery'
  ,'threejs'
  ,'lodash'
  ,'util/GoogleMapsUtil'
  ,'util/RotationHelper'  
  ,'vendor/three/controls/OrbitControls'    
  ], 
  function (angular, $, THREE, _, GoogleMapsUtil, RotationHelper) {
    'use strict';

      var el, $el;
      var $log, $rootScope, $scope;
      var renderer, camera, controls, scene, mesh;
      var rotationHelper;
      var objects = [];
      var io;

      var ProfileController = function ($scope, $rootScope, $log, ProfileIOService) {
        $log.debug('ProfileController created');        
        init($scope, $rootScope, $log, ProfileIOService);

        initScene();
        initCamera();     
        initRenderer();
        initControls();
        rotationHelper = new RotationHelper(renderer.domElement, camera, renderer);     
        rotationHelper.initEvents();

        render();
      };

      /**
       * @ngdoc function
       * @name m3dApp.controller:ProfileCtrl
       * @description
       * # ProfileCtrl
       * Controller of the m3dApp
       */

      var init = function(scope, rootScope, logger, ProfileIOService){
        $log = logger;
        $scope = scope;
        $rootScope = rootScope;
        io = ProfileIOService;

        el = $('#profile')[0];
        $el = $(el);

        $scope.$on('adapter:end', draw);
        $scope.$on('io:model:loaded', drawGeometry);
        $scope.$on('menu:save_button_clicked', function(){
          io.save(objects);
        });
      };  

      /**
      * Remove all objects from canvas
      */
      var clearScene = function(){
        _.each(objects, function(object){
          scene.remove(object);
        });
        objects = [];
      };

      var drawGeometry = function(event, data){
        clearScene();
        var mesh = new THREE.Mesh(data.geometry, new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true, shading: THREE.FlatShading}));
        mesh.geometry.mergeVertices();
        mesh.geometry.computeVertexNormals();
        mesh.name = data.fileName;    
            add(mesh);
      };

      /**
      * Draw elevation profile
      * @param elevationPoints the ProfilePoint objects (including elevation data) for which the elevation profile should be drawn
      */
      var draw = function(event, elevationPoints){
        clearScene();

        // Höhe/Breite und Anzahl Segments berechnen
        var minLng = _.min(_.pluck(elevationPoints, 'lng'));
        var maxLng = _.max(_.pluck(elevationPoints, 'lng'));
        var minLat = _.min(_.pluck(elevationPoints, 'lat'));
        var maxLat = _.max(_.pluck(elevationPoints, 'lat'));
        var minElv = _.min(_.pluck(elevationPoints, 'elv'));
        //var maxElv = _.max(_.pluck(elevationPoints, 'elv'));

        var sw = {'lat': minLat, 'lng': minLng};
        var nw = {'lat': maxLat, 'lng': minLng};
        var ne = {'lat': maxLat, 'lng': maxLng};
        var height = Math.floor(GoogleMapsUtil.degreeToMeter(sw, nw) / 100) * 10;
        var width = Math.floor(GoogleMapsUtil.degreeToMeter(nw, ne) / 100) * 10;
        var segments = Math.sqrt(elevationPoints.length) - 1;
        var thickness = localStorage.getItem('thickness') || 2;
        
        // Ebene konstruieren
            var planeTop = new THREE.Mesh( new THREE.BoxGeometry(thickness, height, width, 1, segments, segments),
                                        new THREE.MeshPhongMaterial({color: 0x00ff00
                                                      ,dynamic: true
                                                    //  ,shading: THREE.FlatShading
                                                    })
                                    );

            var rotationZ = new THREE.Matrix4().makeRotationZ( - Math.PI/2 );
            var rotationX = new THREE.Matrix4().makeRotationX( Math.PI );
            planeTop.updateMatrix();
            planeTop.geometry.applyMatrix(planeTop.matrix);
            planeTop.geometry.applyMatrix(rotationZ);
            planeTop.geometry.applyMatrix(rotationX);
            planeTop.matrix.identity();


        //plane.material.side = THREE.DoubleSide;
        // Höhen der Punkte anpassen
        var diff = 0;
        var side = Math.sqrt(elevationPoints.length);
        
        //planeTop.geometry.vertices.length
        for(var i=0; i < elevationPoints.length; i++){
          diff = elevationPoints[i].elv - minElv;         
          var bottomIndex = (i-i%side) + elevationPoints.length + ((i-i%side)/side + 1)*side - i - 1;
          planeTop.geometry.vertices[i].y += diff / 10; 
          planeTop.geometry.vertices[bottomIndex].y += diff / 10;
        }

        planeTop.geometry.computeFaceNormals();
        planeTop.geometry.computeVertexNormals();
        mesh = planeTop;
            add(planeTop);
      };

      var add = function(object){
        mesh = object;
        scene.add(object);
        objects.push(object);
      };

      var initScene = function(){
        scene = new THREE.Scene();
            var topLight = new THREE.PointLight( 0x404040, 2 );
            topLight.position.set( 500, 500, 500 );       

            var bottomLight = new THREE.PointLight( 0xffffff, 0.4 );  
            bottomLight.position.set(0, -500, 0);

        // red=X, green=Y, blue=Z
        // inset AxisHelper: http://jsfiddle.net/CBAyS/21/
        // Helpers: http://danni-three.blogspot.ch/2013/09/threejs-helpers.html
        var axis = new THREE.AxisHelper(100);
        var grid = new THREE.GridHelper(10,1);      

            scene.add( topLight );
            scene.add( bottomLight );
        scene.add(axis);
        scene.add(grid);
      };

      var initCamera = function(){
        var width = $el.width();
        var height = $el.height();
        camera = new THREE.PerspectiveCamera(45,  width/height, 0.1, 20000);
        scene.add(camera);
        camera.position.set(500,500,500);
        camera.lookAt(scene.position);
      };

      var initRenderer = function(){
        var width = $el.width();
        var height = $el.height();
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( width, height );
        $el.append(renderer.domElement);        
        renderer.precision = 'highp';
            renderer.setClearColor(0x000000, 1);
            renderer.shadowMapEnabled = true;
      };

      var initControls = function(){
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target = new THREE.Vector3(0,0,0);
        controls.minAzimuthAngle = 0;
        controls.maxAzimuthAngle = 0;
        controls.noRotate = true;     
      };

      /**
      * render a single frame
      */
      var render = function(){
        var animate = function(){         
          requestAnimationFrame(animate);
              controls.update();
              if (mesh){
                var rotation = (rotationHelper.targetRotation - mesh.rotation.y) * 0.05;
                mesh.rotation.y += rotation;
              }
          renderer.render(scene, camera);         
        };
        animate();
      };       

      return ['$scope', '$rootScope', '$log', 'ProfileIOService', ProfileController];
});
