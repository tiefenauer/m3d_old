define([
  'angular'
  ,'jquery'
  ,'threejs'
  ,'lodash'
  ,'util/GoogleMapsUtil'
  ,'util/RotationHelper'  
  ,'models/m3dProfilePoint'
  ,'models/m3dProfile'  
  ,'vendor/three/controls/OrbitControls'      
  ], 
  function (angular, $, THREE, _, GoogleMapsUtil, RotationHelper, ProfilePoint, Profile) {
    'use strict';

    var el, $el;
    var $log, $rootScope, $scope;
    var objects = [];
    var scene;
    var renderer;
    var camera, controls, currentMesh;
    var rotationHelper;

  /**
   * ProfileController
   * Controller for digital elevation profile
   * @class
   * @name m3d.controller.ProfileController
   * @namespace
   */
    var ProfileController = function ($scope, $rootScope, $log, ProfileIOService) {
      $log.debug('ProfileController created');        
      renderer = new THREE.WebGLRenderer({ antialias: true });
      scene = new THREE.Scene();
      this.init($scope, $rootScope, $log, ProfileIOService);
    };

    ProfileController.prototype = /** @lends m3d.controller.MenuController.prototype */{

      /**
      * initalize controller
      */
      init: function(scope, rootScope, logger, ProfileIOService){
        $log = logger;
        $scope = scope;
        $rootScope = rootScope;

        el = $('#profile')[0];
        $el = $(el);

        $scope.$on('adapter:end', this.draw);
        $scope.$on('io:model:loaded', drawGeometry);
        $scope.$on('menu:model:save', function(){
          ProfileIOService.save(objects);
        });
        $scope.$on('menu:model:invert', function(){
          ProfileIOService.invert(objects);
        });

        initScene();
        initRenderer();
        this.render();
      },

      /**
      * Draw elevation points
      * @param {Object} event the event that caused the function to be called
      * @param {m3d.models.ProfilePoint[]} array of processed ProfilePoints (including elevation data) for which the elevation profile should be drawn
      */
      draw: function(event, elevationPoints){
        clearScene();

        var thickness = localStorage.getItem('thickness') || 2;
        var m3dModel = new Profile(elevationPoints, thickness);
        add(m3dModel);
      },

      /**
      * Render objects on canvas
      * @param {Object[]} objects the objects to render
      */
      render: function(){
        var animate = function(){         
          requestAnimationFrame(animate);
              controls.update();
                _.each(objects, function(m3dProfile){
                var rotation = (rotationHelper.targetRotation - m3dProfile.mesh.rotation.y) * 0.05;
                m3dProfile.mesh.rotation.y += rotation;
              });              
          renderer.render(scene, camera);         
        };
        animate();
      }
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
      if (data.geometry instanceof THREE.Scene){
        scene = data.geometry;
        objects = data.geometry.children;
        initScene();
        initRenderer();
        render();
      }
      else{
        var mesh = new THREE.Mesh(data.geometry, new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true, shading: THREE.FlatShading}));
        mesh.geometry.mergeVertices();
        mesh.geometry.computeVertexNormals();
        mesh.name = data.fileName;    
        add(mesh);
      }
    };

    var add = function(m3dModel){
      currentMesh = m3dModel.mesh;
      scene.add(m3dModel.mesh);
      objects.push(m3dModel);
    };

    var initScene = function(){        
      var topLight = new THREE.PointLight( 0x404040, 1.8 );
      topLight.position.set( 1000, 1000, 1000 );       

      var bottomLight = new THREE.PointLight( 0xffffff, 0.4 );  
      bottomLight.position.set(0, -500, 0);

      var hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.3 ); 
      hemiLight.color.setHSL( 0.6, 1, 0.6 );
      hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
      hemiLight.position.set( 0, 500, 0 );        

      var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light

      // red=X, green=Y, blue=Z
      // inset AxisHelper: http://jsfiddle.net/CBAyS/21/
      // Helpers: http://danni-three.blogspot.ch/2013/09/threejs-helpers.html
      var axis = new THREE.AxisHelper(100);
      var grid = new THREE.GridHelper(10,1);      

      scene.add( topLight );
      scene.add(hemiLight);
      scene.add( bottomLight );
      scene.add(ambientLight);
      scene.add(axis);
      scene.add(grid);
      initCamera();     
      initControls();               
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
      renderer.setSize( width, height );
      $el.append(renderer.domElement);        
      renderer.precision = 'highp';
      renderer.setClearColor(0x000000, 1);
      renderer.shadowMapEnabled = true;

      rotationHelper = new RotationHelper(renderer.domElement, camera, renderer);     
      rotationHelper.initEvents();         
    };

    var initControls = function(){
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target = new THREE.Vector3(0,0,0);
      controls.minAzimuthAngle = 0;
      controls.maxAzimuthAngle = 0;
      controls.noRotate = true;     
    };

    return ['$scope', '$rootScope', '$log', 'ProfileIOService', ProfileController];
});
