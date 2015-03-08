define([
  'angular'
  ,'lodash'
  ,'models/footprint'
  ,'models/m3dProfilePoint'     
  ], 
  function(angular, _, Footprint, ProfilePoint){

    var poly;

    /**
     * Footprint
     * Base class for a rectangular or polygonal footprint
     * @class
     * @name m3d.model.Footprint
     * @namespace
     * @constructor
     */
    var PolyFootprint = function(map){
      Footprint.call(this, map);
    };

    PolyFootprint.prototype = Object.create(Footprint.prototype);

    PolyFootprint.prototype.getProfilePoints = function(){
      if (!this.profilePoints || this.profilePoints.length == 0)
        this.profilePoints = this.rasterize();
      return this.profilePoints;
    };

    PolyFootprint.prototype.rasterize = function(){
      var profilePoints = [];
      this.poly.getPath().forEach(function(latLng){
        profilePoints.push(new ProfilePoint({
          lat: latLng.lat(), 
          lng: latLng.lng()
        }));
      });
      return profilePoints;
    };

    PolyFootprint.prototype.setMap = function(map){
      Footprint.prototype.setMap.call(this, map);
      var dm = this.dm = new google.maps.drawing.DrawingManager({
         map: this.map
        ,drawingControl: false
        ,drawingMode: google.maps.drawing.OverlayType.POLYGON
      });
      google.maps.event.addListener(this.dm, 'polygoncomplete', angular.bind(this, function(polygon){
        this.shape = this.poly = polygon;
        dm.setDrawingMode(null);
        this.shape.setOptions({
          draggable: true, editable: true ,
          strokeColor: '#ff0000',
          strokeWeight: 5
        });
      }));
    }


    return PolyFootprint;
});