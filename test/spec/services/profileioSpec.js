/*jshint unused: vars */
define([
   'angular'
  ,'angular-mocks'
  ,'app'
  ], 
  function(angular, mocks, app) {
  'use strict';

  describe('Service: ProfileIOService', function () {

    // load the service's module
    beforeEach(module('m3d.services'));


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

    it('should broadcast an event when file is loaded', function(){
      spyOn(rootScope, '$broadcast');
      spyOn(THREE.STLLoader.prototype, 'loadLocal').and.callFake(function(fileArg, callbackArg){
        callbackArg({}, fileArg);
      });
      var file = {name: 'test.stl'};
      ProfileIOService.load(null, file);

      // assertions
      expect(rootScope.$broadcast).toHaveBeenCalled();
      expect(rootScope.$broadcast.calls.mostRecent().args[0]).toBe('io:model:loaded');
      expect(rootScope.$broadcast.calls.mostRecent().args[1]).not.toBe(null);
      expect(rootScope.$broadcast.calls.mostRecent().args[1].fileName).toBe('test');
    });

    it('should use the correct loader for each file type', function(){
      var dummyLoadLocal = function(fileArg, callbackArg){
        callbackArg({}, fileArg);
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

    it('should save each model into a separate file', function(){
      var objects = [
        {name: 'dummy1', geometry: dummyModel.geometry},
        {name: 'dummy2', geometry: dummyModel.geometry}
      ];

      spyOn(window, 'saveAs');
      ProfileIOService.save(objects);

      expect(window.saveAs.calls.count()).toBe(2);
      expect(window.saveAs.calls.argsFor(0)).toContain('dummy1_generated.stl');
      expect(window.saveAs.calls.argsFor(1)).toContain('dummy2_generated.stl');
    });

    it('should produce a correct STL-String', function(done){
      spyOn(window, 'saveAs');
      ProfileIOService.save([dummyModel]);
      var stlBlob = window.saveAs.calls.mostRecent().args[0];
      var fr = new FileReader();
      fr.onload = function(event){
        var savedString = event.target.result;                
        expect(savedString).toBe('solid pixel\nfacet normal 1 1 0 \nouter loop \nvertex 0 1 0 \nvertex 1 0 0 \nvertex 1 0 0 \nendloop \nendfacet \nfacet normal 1 0 1 \nouter loop \nvertex 1 0 0 \nvertex 0 1 0 \nvertex 1 0 0 \nendloop \nendfacet \nfacet normal 0 1 1 \nouter loop \nvertex 1 0 0 \nvertex 1 0 0 \nvertex 0 1 0 \nendloop \nendfacet \nendsolid');
        done();
      };
      fr.readAsBinaryString(stlBlob);
    });

  });
});
