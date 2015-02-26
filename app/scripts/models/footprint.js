define([
   'angular'
  ,'lodash'
  ,'models/m3dProfilePoint'   
  ], 
  function(angular, _, ProfilePoint){

    /**
     * Footprint
     * Base class for a rectangular or polygonal footprint
     * @class
     * @name m3d.model.Footprint
     * @namespace
     * @constructor
     */
    var Footprint = function(map){
      this.map = map;
      this.shape = null;
    };

    Footprint.prototype.rasterize = function(){
      return [];
    };

    Footprint.prototype.setMap = function(map){
      this.map = map;
    };

    Footprint.prototype.setShape = function(shape){
      this.shape = shape;
    };

    return Footprint;
});