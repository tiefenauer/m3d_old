/*jshint unused: vars */
define([
   'angular'
  ,'angular-mocks'
  ,'app'
  ,'models/m3dProfile'
  ], 
  function(angular, mocks, app, Profile) {
  'use strict';

  describe('Service: ProfileIOService', function () {

    // load the service's module
    beforeEach(module('m3d.services'));

    // Mock für den Inhalt eines geladenen Files
    var mockGeometry = new THREE.BoxGeometry(1,1,1);

    // Mesh mit der Mock-Geometrie
    var mockMesh = new THREE.Mesh(mockGeometry, new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true }))

    var mockProfile = new Profile({
      name: 'mockProfile',
      mesh: mockMesh      
    });

    // mock für ein zu speicherndes Profil
    /*
    var dummyModel = {name: 'test', geometry: {
      vertices: [
        {x: 1, y: 0, z: 0},
        {x: 0, y: 1, z: 0},
        {x: 0, y: 0, z: 1}
      ],
      faces: [
        {a:1, b: 0, c:0, normal: {x: 1, y: 1, z: 0}},
        {a:0, b: 1, c:0, normal: {x: 1, y: 0, z: 1}},
        {a:0, b: 0, c:1, normal: {x: 0, y: 1, z: 1}}
      ]
    }};
    */

    // instantiate service
    var ProfileIOService, rootScope;
    beforeEach(inject(function (_ProfileIOService_, $injector) {
      ProfileIOService = _ProfileIOService_;
      rootScope = $injector.get('$rootScope');
    }));

    it('should be a valid ProfileIOService object', function () {
      expect(!!ProfileIOService).toBe(true);
      expect(typeof(ProfileIOService)).toBe('object');
      expect(ProfileIOService.load).not.toBe(null);
      expect(typeof(ProfileIOService.load)).toBe('function');
      expect(ProfileIOService.save).not.toBe(null);
      expect(typeof(ProfileIOService.save)).toBe('function');
    });

    xit('should broadcast an event when file is loaded', function(){
      spyOn(rootScope, '$broadcast');      
      // Laden des Files mocken      
      spyOn(THREE.STLLoader.prototype, 'loadLocal').and.callFake(function(fileArg, callbackArg){
        callbackArg(mockGeometry, fileArg);
      });
      var file = {name: 'test.stl'};
      ProfileIOService.load(null, file);

      // assertions
      expect(rootScope.$broadcast).toHaveBeenCalled();
      expect(rootScope.$broadcast.calls.mostRecent().args[0]).toBe('io:model:loaded');
      expect(rootScope.$broadcast.calls.mostRecent().args[1]).not.toBe(null);
      expect(rootScope.$broadcast.calls.mostRecent().args[1] instanceof Profile).toBe(true);
      expect(rootScope.$broadcast.calls.mostRecent().args[1].name).toBe('test');
      expect(rootScope.$broadcast.calls.mostRecent().args[1].mesh).not.toBe(null);
      expect(rootScope.$broadcast.calls.mostRecent().args[1].mesh.geometry).toEqual(mockGeometry);
    });

    it('should use the correct loader for each file type', function(){
      var dummyLoadLocal = function(fileArg, callbackArg){
        callbackArg(mockGeometry, fileArg);
      };
      spyOn(THREE.STLLoader.prototype, 'loadLocal').and.callFake(dummyLoadLocal);
      spyOn(THREE.VRMLLoader.prototype, 'loadLocal').and.callFake(dummyLoadLocal);

      // check with STL file
      ProfileIOService.load(null, {name: 'test.stl'});
      expect(THREE.STLLoader.prototype.loadLocal).toHaveBeenCalled();

      // check with VRML file
      ProfileIOService.load(null, {name: 'test.wrl'});
      expect(THREE.VRMLLoader.prototype.loadLocal).toHaveBeenCalled();
    });

    xit('should save each model into a separate file', function(){
      spyOn(window, 'saveAs');
      ProfileIOService.save(mockProfile);

      expect(window.saveAs.calls.count()).toBe(1);
      expect(window.saveAs.calls.mostRecent().args).toContain('mockProfile_generated.stl');
    });

    xit('should produce a correct STL-String', function(done){
      spyOn(window, 'saveAs');
      ProfileIOService.save(mockProfile);

      var stlBlob = window.saveAs.calls.mostRecent().args[0];
      var fr = new FileReader();
      fr.onload = function(event){
        var savedString = event.target.result;                
        expect(savedString).not.toBe(null);
        done();
      };
      fr.readAsBinaryString(stlBlob);
    });

  });
});
