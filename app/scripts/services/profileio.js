'use strict';
define([
   'angular'
  ,'threejs'
  ,'models/m3dProfile'
  ,'lodash'
  ,'services/STLLoader'
  ,'services/VRMLLoader'
  ,'util/FileSaver.min'
  ,'vendor/three/ThreeCSG'
  ], 
  function (angular, THREE, Profile, _) {

    var $log, $rootScope;
    var loader;

    /**
     * ProfileIOService
     * Service to load and save files from/to file
     * @class
     * @name m3d.services.ProfileIOService 
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
      save: function(profiles){
        _.each(profiles, function(profile){
          var fileName = profile.name || 'stlModel';
          fileName += '_generated';
          $log.debug('Saving model to ' + fileName + '.stl ...');
          var stlString = generateStl(profile.mesh.geometry);
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
        });
      },

      /**
      * create a mold by inverting the objects
      * @param {m3d.models.Profile[]} profiles the profiles to be inverted
      */
      invert: function(profiles){
        _.each(profiles, function(profile){
          // Quader für Gussform vorbereiten
          var boxBorderThickness = profile.getDimensionY() * 1.1 - profile.getDimensionY();
          var boxWidth = profile.getDimensionX() + boxBorderThickness;
          var boxHeight = profile.getDimensionY() * 2 + boxBorderThickness;
          var boxDepth =  profile.getDimensionZ() + boxBorderThickness;
          var boxGeometry = new THREE.BoxGeometry(boxDepth, boxHeight, boxWidth);
          boxGeometry.dynamic = true;
          // y-Position der unteren Vertices anpassen
          boxGeometry.vertices.forEach(function(vertex){
            if (vertex.y < 0)
              vertex.y = -1 * boxBorderThickness;
          });
          boxGeometry.verticesNeedUpdate = true;

          // Modell kopieren und Sockel erstellen
          var profileCopy = new Profile({
            profilePoints: profile.profilePoints,
          });
          for(var i=0;i<profileCopy.profilePoints.length; i++){
            var bottomIndex = profileCopy.getBottomIndex(i);                        
            profileCopy.mesh.geometry.vertices[bottomIndex].y = -1 * boxHeight;            
          }
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
          profile.mold = mold;

          $rootScope.$broadcast('io:model:inverted', profile);
        });        
      }

    };

    var onStlLoaded = function(geometry, file){
      var fileName = file.name.substr(0, file.name.lastIndexOf('.'));
      var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true, shading: THREE.FlatShading}));
      mesh.geometry.mergeVertices();
      mesh.geometry.computeVertexNormals();
      var profile = new Profile({
        mesh: mesh
      });
      $rootScope.$broadcast('io:model:loaded', profile);
    };

    var onVrmlLoaded = function(content, file){
      var fileName = file.name.substr(0, file.name.lastIndexOf('.'));
      scene = data.geometry;
      objects = data.geometry.children;
      initScene();
      initRenderer();
      render();
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