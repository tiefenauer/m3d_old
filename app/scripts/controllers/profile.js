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
    var profiles = {};
    var scene;
    var renderer;
    var camera, controls, currentMesh, currentProfile;
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
        $scope.$on('io:model:inverted', function(event, profile){
          drawMold(profile);
        });
        $scope.$on('io:model:loaded', function(event, profile){
          drawProfile(profile);
        });
        $scope.$on('menu:model:save', function(){
          ProfileIOService.save(profiles);
        });
        $scope.$on('menu:model:invert', function(){
          invertProfile();
          //ProfileIOService.invert(profiles);
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
      draw: function(event, profilePoints){
        clearScene();

        var thickness = localStorage.getItem('thickness') || undefined;
        var m3dProfile = new Profile({
          profilePoints: profilePoints,
          thickness: thickness
        });
        drawProfile(m3dProfile);
      },

      /**
      * Render profiles on canvas
      * @param {Object[]} profiles the profiles to render
      */
      render: function(){
        var animate = function(){         
          requestAnimationFrame(animate);
              controls.update();
                _.each(profiles, function(m3dProfile){
                  m3dProfile.rotate(rotationHelper.targetRotation, 0.05);
                  /*
                  var rotation = (rotationHelper.targetRotation - m3dProfile.mesh.rotation.y) * 0.05;
                  m3dProfile.mesh.rotation.y += rotation;
                  */
                });              
          renderer.render(scene, camera);         
        };
        animate();
      }
    };

    /**
    * Remove all profiles from canvas
    */
    var clearScene = function(){
      _.each(profiles, function(profile){
        remove(profile);
      });
    };

    var drawProfile = function(m3dProfile){
      clearScene();
      profiles[m3dProfile.name] = m3dProfile;
      add(m3dProfile.mesh);
    };

    var drawMold = function(m3dProfile){
      clearScene();
      add(m3dProfile.mold);
    };

    var invertProfile = function(){
      if (currentMesh == currentProfile.mesh){
        drawMold(currentProfile);
      }
      else {
        drawProfile(currentProfile);
      }
    };

    var add = function(mesh){
      currentMesh = mesh;
      scene.add(mesh);      
    };

    var remove = function(m3dModel){
      var remObj;
      if (typeof m3dModel.name != 'undefined' && m3dModel.name != null && m3dModel.name.length > 0)
        remObj = scene.getObjectByName(m3dModel.name);
      else
        remObj = m3dModel.mesh;
      scene.remove(remObj);      
    };


    var initScene = function(){        
      var topLight = new THREE.PointLight( 0x404040, 1.8 );
      topLight.position.set( 10000, 10000, 10000 );       

      var bottomLight = new THREE.PointLight( 0xffffff, 0.4 );  
      bottomLight.position.set(0, -5000, 0);

      var hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.3 ); 
      hemiLight.color.setHSL( 0.6, 1, 0.6 );
      hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
      hemiLight.position.set( 0, 5000, 0 );        

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
      camera = new THREE.PerspectiveCamera(45,  width/height, 0.1, 200000);
      scene.add(camera);
      camera.position.set(5000,5000,5000);
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
