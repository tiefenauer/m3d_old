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
    var $log, $scope, $ProfileIOService, $ProfileOutlineService;
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
    var ProfileController = function (scope, log, ProfileIOService, ProfileOutlineService) {
      $log = log;
      $scope = scope;
      $ProfileOutlineService = ProfileOutlineService;
      $ProfileIOService = ProfileIOService;
      $log.debug('ProfileController created');        

      el = $('#profile')[0];
      $el = $(el);      
      renderer = new THREE.WebGLRenderer({ antialias: true });
      scene = new THREE.Scene();
      
      $scope.$on('adapter:end', function(event, profilePoints){
        clearScene();
        var m3dProfile = ProfileOutlineService.createProfile(profilePoints);
        drawProfile(m3dProfile);
      });
      $scope.$on('io:model:loaded', function(event, profile){
        drawProfile(profile);
      });
      $scope.$on('menu:model:save', function(){
        ProfileIOService.save(currentProfile);
      });
      $scope.$on('menu:model:invert', this.toggleInvert);

      initScene();
      initRenderer();
      this.render();

      $scope.$on('outline:created', function(event, outline){
        drawProfile(outline);
      });            
    };

    ProfileController.prototype = /** @lends m3d.controller.MenuController.prototype */{

      /**
      * Toggle between model and inverted model (mold)
      */
      toggleInvert: function(){
        if (!currentProfile)
          return;

        if (currentMesh == currentProfile.mesh){
          if (!currentProfile.mold)
            currentProfile.mold = $ProfileOutlineService.invert(currentProfile);
          draw(currentProfile.mold);
        }
        else {
          draw(currentProfile.mesh);
        }
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
      currentProfile = m3dProfile;
      profiles[m3dProfile.name] = m3dProfile;
      draw(m3dProfile.mesh);
    };

    var draw = function(mesh){
      clearScene();
      currentMesh = mesh;
      scene.add(mesh);      
    };

    var remove = function(m3dProfile){
      var mesh = scene.getObjectByName(m3dProfile.mesh.name);
      if (m3dProfile.mold)
        var mold = scene.getObjectByName(m3dProfile.mold.name);
      scene.remove(mesh);
      scene.remove(mold);
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

    return ['$scope', '$log', 'ProfileIOService', 'ProfileOutlineService', ProfileController];
});
