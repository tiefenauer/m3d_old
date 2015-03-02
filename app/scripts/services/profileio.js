'use strict';
define([
   'angular'
  ,'lodash'
  ,'threejs'
  ,'models/m3dProfile'
  ,'services/STLLoader'
  ,'services/VRMLLoader'
  ,'util/FileSaver.min'
  ,'vendor/three/ThreeCSG'
  ], 
  function (angular, _, THREE, Profile) {

    var $log, $rootScope;
    var loader;

    /**
     * ProfileIOService
     * Service to load and save files from/to file
     * @class
     * @name m3d.services.ProfileIOService 
     * @constructor
     * @namespace
     */
    var ProfileIOService = function($log, $rootScope){
      $log.debug('ProfileIOService created...');
      this.init($log, $rootScope);
    };

    ProfileIOService.prototype = /** @lends m3d.services.ProfileIOService.prototype */{
      /**
      * initialize
      */
      init: function(logger, scope){
        $log = logger;
        $rootScope = scope;
        $rootScope.$on('menu:model:load', this.load);        
      },

      /**
      * load model from file
      * @param {m3d.events.io} event the event that was fired
      * @fires io:model:loaded
      */
      load: function(event, file){
        $log.debug('Loading from ' + file.name + ' ...');
        var callback;
        switch(true){
          case new RegExp('.stl').test(file.name):
            loader = new THREE.STLLoader();
            callback = onStlLoaded;
            break;
          case new RegExp('.wrl').test(file.name):
            loader = new THREE.VRMLLoader();
            callback = onVrmlLoaded;
            break;
        }
        if(loader)
          loader.loadLocal(file, callback);
      },

      /**
      * save model to file
      * @param {m3d.models.Profile[]} profiles the profiles to be saved. Each object will be saved to a separate file.
      */
      save: function(mesh){
        var fileName = mesh.name || 'stlModel_generated';
        $log.debug('Saving model to ' + fileName + '.stl ...');
        var stlString = generateStl(mesh.geometry);
        // Bug in PhantomJS: https://github.com/ariya/phantomjs/issues/11013
        var blob;
        if (typeof WebKitBlobBuilder !== 'undefined'){
          var builder = new WebKitBlobBuilder();
          builder.append(stlString);
          blob = builder.getBlob();
        }
        // funktioniert nur in Browsern
        else {
          blob = new Blob([stlString], {type: 'text/plain'});
        }
        
        window.saveAs(blob, fileName + '.stl');
      }
    };

    var onStlLoaded = function(geometry, file){
      var fileName = file.name.substr(0, file.name.lastIndexOf('.'));
      var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true, shading: THREE.FlatShading}));
      mesh.geometry.mergeVertices();
      mesh.geometry.computeVertexNormals();      
      $rootScope.$broadcast('io:model:loaded', mesh);
    };

    var onVrmlLoaded = function(content, file){
      var fileName = file.name.substr(0, file.name.lastIndexOf('.'));
      //var scene = content.geometry;
      //var objects = content.geometry.children;
    };

    var generateStl = function(geometry){
      var stl = 'solid pixel\n';

      var stringifyVector = function(vec){
          return ''+vec.x+' '+vec.y+' '+vec.z;
      };
      var stringifyVertex = function(vec){
          return 'vertex ' + vec.x + ' ' + vec.y + ' ' + vec.z + ' \n';
      };

      var vertices, tris, i;
      if (geometry instanceof THREE.BufferGeometry){        
        var positions = geometry.getAttribute('position').array;
        var normals = geometry.getAttribute('normal').array;
        for (i=0; i< normals.length; i+=3*3){         
          var n1 = normals[i];
          var n2 = normals[i+1];
          var n3 = normals[i+2];
          stl += ('facet normal '+n1+' '+n2+' '+n3+' \n');
            stl += ('outer loop \n');

          for (var j=i; j<i+9; j+=3){
            var x = positions[j];
            var y = positions[j+1];
            var z = positions[j+2];
            stl += 'vertex '+x+' '+y+' '+z+' \n';
          }
          stl += ('endloop \n');
          stl += ('endfacet \n');         
        }
      }
      else {
        vertices = geometry.vertices;
        tris     = geometry.faces;
        for(i = 0; i<tris.length; i++){
          stl += ('facet normal '+stringifyVector( tris[i].normal )+' \n');
          stl += ('outer loop \n');
          stl += stringifyVertex( vertices[ tris[i].a ]);
          stl += stringifyVertex( vertices[ tris[i].b ]);
          stl += stringifyVertex( vertices[ tris[i].c ]);
          stl += ('endloop \n');
          stl += ('endfacet \n');
        }
      }         
      stl += ('endsolid');

      return stl;
    };

    return ['$log', '$rootScope', ProfileIOService];    
});

/**
* This event indicates that a model has been loaded
* @name m3d.events.io
* @event io:model:loaded
* @property {THREE.geometry} geometry of the model
* @property {String} fileName name of the file the model was loaded from
*/