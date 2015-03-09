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
      
      $scope.$on('adapter:end', angular.bind(this, function(event, footprint){
        this.clearScene();
        var m3dProfile = ProfileOutlineService.createProfile(footprint);
        this.drawProfile(m3dProfile);
      }));
      $scope.$on('io:model:loaded', angular.bind(this, function(event, mesh){
        this.clearScene();
        var profile = ProfileOutlineService.createFromMesh(mesh);
        this.drawProfile(profile);
      }));
      $scope.$on('menu:model:save', angular.bind(this, function(){
        ProfileIOService.save(this.currentMesh);
      }));
      $scope.$on('menu:model:invert', angular.bind(this, function(){
        if (!this.currentProfile)
          return;
        this.stopRotation();
        this.toggleInvert();
      }));
      this.initRenderer();
      this.initScene();
      this.render();

      $scope.$on('outline:created', angular.bind(this, function(event, outline){
        this.drawProfile(outline);
      }));
    };

    ProfileController.prototype.profiles = {};
    ProfileController.prototype.currentMesh = null;
    ProfileController.prototype.currentProfile = null;

    ProfileController.prototype.stopRotation = function(){
      if (this.currentMesh){
        this.rotationHelper.stop(this.currentMesh.rotation.y);
        this.rotationHelper.start();
      }
    };

    ProfileController.prototype.toggleInvert = function(){
      if (!this.currentProfile)
        return;

      if (this.currentMesh == this.currentProfile.mesh){
        if (!this.currentProfile.mold)
          this.currentProfile.mold = $ProfileOutlineService.invert(this.currentProfile);
        this.draw(this.currentProfile.mold);
      }
      else {
        this.draw(this.currentProfile.mesh);
      }
    };

    /**
    * Render profiles on canvas
    * @param {Object[]} profiles the profiles to render
    */
    ProfileController.prototype.render = function(){
      var animate = angular.bind(this, function(){         
        requestAnimationFrame(animate);
        this.controls.update();
        _.each(this.profiles, angular.bind(this, function(m3dProfile){
          if (!this.rotationHelper.active)
            return;
          var rotation = (this.rotationHelper.targetRotation - m3dProfile.mesh.rotation.y) * 0.05;
          m3dProfile.mesh.rotation.y += rotation;
          if (m3dProfile.mold)
              m3dProfile.mold.rotation.y += rotation;          
        }));
        this.renderer.render(this.scene, this.camera);
      });
      animate();
    };

    ProfileController.prototype.initRenderer = function(){
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      var width = $el.width();
      var height = $el.height();
      this.renderer.setSize( width, height );
      $el.append(this.renderer.domElement);        
      this.renderer.precision = 'highp';
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.shadowMapEnabled = true;
    };

    ProfileController.prototype.initScene = function(){    
      this.scene = new THREE.Scene();    
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

      this.scene.add( topLight );
      this.scene.add(hemiLight);
      this.scene.add( bottomLight );
      this.scene.add(ambientLight);
      this.scene.add(axis);
      this.scene.add(grid);
      this.initCamera();     
      this.initControls();               
    };

    ProfileController.prototype.initCamera = function(){
      var width = $el.width();
      var height = $el.height();
      this.camera = new THREE.PerspectiveCamera(45,  width/height, 0.1, 200000);
      this.scene.add(this.camera);
      this.camera.position.set(50,50,50);
      this.camera.lookAt(this.scene.position);
    };

    ProfileController.prototype.initControls = function(){
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target = new THREE.Vector3(0,0,0);
      this.controls.minAzimuthAngle = 0;
      this.controls.maxAzimuthAngle = 0;
      this.controls.noRotate = true;     

      this.rotationHelper = new RotationHelper(this.renderer.domElement, this.camera, this.renderer);     
      this.rotationHelper.start();
    };

    ProfileController.prototype.clearScene = function(){
      _.each(this.profiles, angular.bind(this, function(profile){
        this.remove(profile);
      }));
    };

    ProfileController.prototype.drawProfile = function(m3dProfile){      
      this.currentProfile = m3dProfile;
      this.profiles[m3dProfile.name] = m3dProfile;
      this.draw(m3dProfile.mesh);
    };

    ProfileController.prototype.draw = function(mesh){
      this.clearScene();
      this.currentMesh = mesh;
      this.scene.add(mesh);      
    };

    ProfileController.prototype.remove = function(m3dProfile){
      if (!m3dProfile)
        return;
      var mesh = this.scene.getObjectByName(m3dProfile.mesh.name);
      if (m3dProfile.mold)
        var mold = this.scene.getObjectByName(m3dProfile.mold.name);
      this.scene.remove(mesh);
      this.scene.remove(mold);
    };

    return ['$scope', '$log', 'ProfileIOService', 'ProfileOutlineService', ProfileController];
});
