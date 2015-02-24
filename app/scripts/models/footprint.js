define([
   'angular'
  ,'lodash'
  ], 
  function(angular, _){

    /**
     * Footprint
     * Base class for a rectangular or polygonal footprint
     * @class
     * @name m3d.model.Footprint
     * @namespace
     * @constructor
     */
    var Footprint = function(){

    };

    Footprint.prototype = /** @lends m3d.model.Profile.prototype */ { 
      rasterize: function(){

      }
    };

    return Footprint;
});