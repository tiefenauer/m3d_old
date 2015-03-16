define([
   'angular'
  ,'lodash'
  ,'threejs'
  ,'models/footprint'
  ,'models/m3dProfilePoint'   
  ,'util/ProfileUtil'
  ], 
  function(angular, _, THREE, Footprint, ProfilePoint, ProfileUtil){

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
      var tilesLoadedListener = google.maps.event.addListener(this.shape, 'bounds_changed', angular.bind(this, function(){
        this.profilePoints = null;
      }));      
    };

    RectFootprint.prototype = Object.create(Footprint.prototype);

    RectFootprint.prototype.horizontalSegments = 0;
    RectFootprint.prototype.verticalSegments = 0;

    RectFootprint.prototype.getProfilePoints = function(){
      var resolution = localStorage.getItem('resolution') || 25;
      this.horizontalSegments = parseInt(resolution);
      this.verticalSegments = parseInt(resolution);

      if (!this.profilePoints || this.profilePoints.length != Math.pow(this.horizontalSegments, 2))
        this.profilePoints = this.rasterize();
      return this.profilePoints;
    };

    /**
    * Rasterize current footprint returning an array of profile points (elevation is zero)
    * @returns {ProfilePoint} array of ProfilePoints
    */
    RectFootprint.prototype.rasterize = function(){
      if (!this.shape)
        return [];
      var resolution = localStorage.getItem('resolution') || 25;
      this.horizontalSegments = parseInt(resolution);
      this.verticalSegments = parseInt(resolution);

      var rect = this.shape;
      // Positionen der Ecken bestimmen
      var ne = rect.getBounds().getNorthEast();
      var sw = rect.getBounds().getSouthWest();
      var nw = new google.maps.LatLng(ne.lat(), sw.lng());
      var se = new google.maps.LatLng(sw.lat(), ne.lng());
      
      // get values on x-axis
      var xFrom = nw.lng();
      var xTo = ne.lng(); 
      var xStep = (xTo-xFrom)/(this.horizontalSegments - 1);
      
      // get values on y-axis
      var yFrom = se.lat();
      var yTo = ne.lat();
      var yStep = (yTo-yFrom)/(this.verticalSegments - 1);
      
      var profilePoints = [];
      for(var y=0; y<this.verticalSegments; y++){
        var yVal = yTo - y*yStep;
        
        for (var x=0; x<this.horizontalSegments; x++){
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
      //this.shape.setBounds(this.initialRectBounds);
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

    RectFootprint.prototype.initialRectBounds = new google.maps.LatLngBounds(
      // southwest
      new google.maps.LatLng(45.9, 7.6),
      // northEast
      new google.maps.LatLng(46.0, 7.7)
      );

    return RectFootprint;
});