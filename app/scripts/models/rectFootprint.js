define([
   'angular'
  ,'lodash'
  ,'models/footprint'
  ,'models/m3dProfilePoint'   
  ], 
  function(angular, _, Footprint, ProfilePoint){

    var rect;

    /**
     * Footprint
     * Base class for a rectangular or polygonal footprint
     * @class
     * @name m3d.model.Footprint
     * @namespace
     * @constructor
     */
    var RectFootprint = function(map){
      Footprint.call(this, map);
      this.shape = rect = new google.maps.Rectangle({editable: true, draggable: true});      
    };

    RectFootprint.prototype = Object.create(Footprint.prototype);

    RectFootprint.prototype.rasterize = function(){
      if (!this.shape)
        return [];
      var resolution = localStorage.getItem('resolution') || 25;
      gridSize = horizontalSegments = verticalSegments = parseInt(resolution);

      var rect = this.shape;
      // Positionen der Ecken bestimmen
      var ne = rect.getBounds().getNorthEast();
      var sw = rect.getBounds().getSouthWest();
      var nw = new google.maps.LatLng(ne.lat(), sw.lng());
      var se = new google.maps.LatLng(sw.lat(), ne.lng());
      
      // get values on x-axis
      var xFrom = nw.lng();
      var xTo = ne.lng(); 
      var xStep = (xTo-xFrom)/(horizontalSegments - 1);
      
      // get values on y-axis
      var yFrom = se.lat();
      var yTo = ne.lat();
      var yStep = (yTo-yFrom)/(verticalSegments - 1);
      
      var profilePoints = [];
      for(var y=0; y<verticalSegments; y++){
        var yVal = yTo - y*yStep;
        
        for (var x=0; x<horizontalSegments; x++){
          var xVal = xFrom + x*xStep;
          var lat = Number(parseFloat(yVal).toFixed(4));
          var lng = Number(parseFloat(xVal).toFixed(4));
          profilePoints.push(new ProfilePoint({lat: lat, lng: lng, elv: 0}));
        }
      }
      return profilePoints;
    };

    RectFootprint.prototype.setMap = function(map){
      Footprint.prototype.setMap.call(this, map);
      this.shape.setMap(this.map);
      this.shape.setBounds(this.getRectBounds());
    };

    RectFootprint.prototype.getRectBounds = function(){
      var mapBounds = this.map.getBounds();
      var rectNorthEast = new google.maps.LatLng(
         mapBounds.getNorthEast().lat() - (mapBounds.getNorthEast().lat() - mapBounds.getSouthWest().lat())*0.3
        ,mapBounds.getNorthEast().lng() - (mapBounds.getNorthEast().lng() - mapBounds.getSouthWest().lng())*0.3
      );
      var rectSouthWest = new google.maps.LatLng(
         mapBounds.getSouthWest().lat() + (mapBounds.getNorthEast().lat() - mapBounds.getSouthWest().lat())*0.3
        ,mapBounds.getSouthWest().lng() + (mapBounds.getNorthEast().lng() - mapBounds.getSouthWest().lng())*0.3
      );
      var bounds = new google.maps.LatLngBounds(rectSouthWest,rectNorthEast);
      return bounds;
    };

    return RectFootprint;
});