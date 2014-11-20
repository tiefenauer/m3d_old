define([
   'angular'
  ,'services/STLLoader'
  ,'util/FileSaver.min'
  ], 
  function (angular, STLLoader) {
    'use strict';

    var $log, $rootScope;
    var loader;

    var ProfileIOService = function($log, $rootScope){
      $log.debug('ProfileIOService created...');
      init($log, $rootScope);
      addEventListeners();

      return {
         load: angular.bind(this, load)
        ,save: angular.bind(this, save)
        //,generateStl: generateStl
      };
    };

    var init = function(logger, scope){
      $log = logger;
      $rootScope = scope;
      loader = new THREE.STLLoader();
    };

    var addEventListeners = function(){
      loader.addEventListener('load', onFileLoaded);      
      $rootScope.$on('menu:loadProfile', load);
    }

    var load = function(event, file){
      $log.debug('Loading from ' + file.name + ' ...');
      loader.loadLocal(file);
    };

    var save = function(objects){
      var modelNames = "";
      objects.forEach(function(model){
        var fileName = model.name || 'stlModel';
        fileName += "_generated";
        $log.debug('Saving model to ' + fileName + '.stl ...');
        var stlString = generateStl(model.geometry);
        var blob = new Blob([stlString], {type: 'text/plain'});
        window.saveAs(blob, fileName + ".stl");
      });
    };

    var onFileLoaded = function(event){
      var geometry = event.content;
      var fileName = event.file.name.substr(0, event.file.name.lastIndexOf("."));
      $rootScope.$broadcast('io:model:loaded', {geometry: geometry, fileName: fileName});
    };

    var generateStl = function(geometry){
      var stl = "solid pixel\n";

      var stringifyVector = function(vec){
          return ""+vec.x+" "+vec.y+" "+vec.z;
      }
      var stringifyVertex = function(vec){
          return "vertex "+vec.x+" "+vec.y+" "+vec.z+" \n";
      }

      var vertices, tris;
      if (geometry instanceof THREE.BufferGeometry){        
        var positions = geometry.getAttribute('position').array;
        var normals = geometry.getAttribute('normal').array;
        for (var i=0; i< normals.length; i+=3*3){         
          var n1 = normals[i];
          var n2 = normals[i+1];
          var n3 = normals[i+2];
          stl += ("facet normal "+n1+" "+n2+" "+n3+" \n");
            stl += ("outer loop \n");

          for (var j=i; j<i+9; j+=3){
            var x = positions[j];
            var y = positions[j+1];
            var z = positions[j+2];
            stl += "vertex "+x+" "+y+" "+z+" \n";
          }
          stl += ("endloop \n");
          stl += ("endfacet \n");         
        }
      }
      else {
        vertices = geometry.vertices;
        tris     = geometry.faces;
        for(var i = 0; i<tris.length; i++){
          stl += ("facet normal "+stringifyVector( tris[i].normal )+" \n");
          stl += ("outer loop \n");
          stl += stringifyVertex( vertices[ tris[i].a ]);
          stl += stringifyVertex( vertices[ tris[i].b ]);
          stl += stringifyVertex( vertices[ tris[i].c ]);
          stl += ("endloop \n");
          stl += ("endfacet \n");
        }
      }         
      stl += ("endsolid");

      return stl
    };

    return ['$log', '$rootScope', ProfileIOService];    
});
