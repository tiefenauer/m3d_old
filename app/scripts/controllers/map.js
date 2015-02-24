'use strict';
define([
   'angular'
  ,'jquery'
  ,'lodash'
  ,'models/m3dProfile'
  ,'models/m3dProfilePoint'    
  ,'vendor/geoxml3'
    /*
  ,'vendor/ProjectedOverlay'
  */
  ], 
  function (angular, $, _, Profile, ProfilePoint) {

    var $log, $scope, $ElevationDataService, $ProfileOutlineService;
    var gridSize;
    var verticalSegments = 25;
    var horizontalSegments = 25;    

    var google = window.google;

    /**
     * MapController
     * Controller for GoogleMap
     * @class
     * @name m3d.controller.MapController
     * @namespace
     */
    var MapController = function (scope, log, ElevationDataService, ProfileOutlineService) {
        $scope = scope;
        $log = log;
        $ElevationDataService = ElevationDataService;
        $ProfileOutlineService = ProfileOutlineService;
        $log.debug('MapController created');
        //this.resetMap = angular.bind(this, this.resetMap);
        this.fitBounds = angular.bind(this, this.fitBounds);
        this.resetMap();

        $scope.$on('menu:places:changed', angular.bind(this, function(event, places){                    
          this.fitBounds(places);          
          this.resetZoom();
        }));
        $scope.$on('menu:model:generate', angular.bind(this, function(event){
          $ElevationDataService.getElevationData(this.getCoordinates());
        }));
        $scope.$on('gemeinde:load', angular.bind(this, function(event, name){
          $log.debug('loading ' + name + ' from file...');
          this.loadGemeinde(name);
        }));
        $scope.$on('menu:drawing:type', angular.bind(this, function(event, type){
          if (type == 'rect')
            this.resetRect();
          else if (type == 'poly')
            this.resetPolygon();            
        }));
        //$scope.$broadcast('gemeinde:load', 'Aarau');        
    };

    MapController.prototype = /** @lends m3d.controller.MapController.prototype */{
      map: null,
      rect: null,
      polygon: null,
      _area: null,

      getCoordinates: function(){
        if (!this._area)
          return [];

        if (this._area == this.rect)
          return this.rasterizeRectangle();

        if (this._area == this.polygon)
          return this.rasterizePolygon();
      },

      /**
      * Rasterize selection rectangle to determine points for which the elevation must be determined.
      * @return {m3d.models.ProfilePoint[]} list of single profile Points for the rasterized selection rectangle. The elevation is zero for each point.
      */
      rasterizeRectangle: function(){
        if (!this.rect)
          return [];
        var resolution = localStorage.getItem('resolution') || 25;
        gridSize = horizontalSegments = verticalSegments = parseInt(resolution);

        var rect = this.rect;
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
      },

      rasterizePolygon: function(){
        if (!this.polygon)
          return [];
        return [];
      },

      resetMap: function(){
        var el = $('#map')[0];
        this.map = new google.maps.Map(el, {
          center : new google.maps.LatLng(45.976433, 7.658448), // Matterhorn
          zoom : 12,
          mapTypeId : google.maps.MapTypeId.ROADMAP,
          scrollwheel: true,
          zoomControl: true
        });
        

        var tilesLoadedListener = google.maps.event.addListener(this.map, 'tilesloaded', angular.bind(this, function(){
          $log.debug('map:tilesloaded');          
          this.resetRect();
          google.maps.event.removeListener(tilesLoadedListener);
        }));
        google.maps.event.addListener(this.map, 'bounds_changed', angular.bind(this, function(){
          $log.debug('map:bounds_changed : ' + this.map.getBounds().getSouthWest().lat() + ',' + this.map.getBounds().getSouthWest().lng() + '/' + this.map.getBounds().getNorthEast().lat() + ',' + this.map.getBounds().getNorthEast().lng());
          if (this.rect)
            this.rect.setBounds(this.getRectBounds());
        }));
      },

      resetRect: function(){
        this.setPolygon(null);
        this.setRect(null);
        var rect = new google.maps.Rectangle({editable: true, draggable: true, map: this.map})
        this.setRect(rect);        
        /*
        // Matterhorn
        new google.maps.LatLngBounds(   
          new google.maps.LatLng(45.956433, 7.63),
          new google.maps.LatLng(46, 7.7 )
        )
        */
      },

      resetPolygon: function(){
        this.setPolygon(null);
        this.setRect(null);
        var dm = this.dm = new google.maps.drawing.DrawingManager({
           map: this.map
          ,drawingControl: false
          ,drawingMode: google.maps.drawing.OverlayType.POLYGON
        });
        google.maps.event.addListener(this.dm, 'polygoncomplete', angular.bind(this, function(polygon){
          this.setPolygon(polygon);
          dm.setDrawingMode(null);
        }));
      },

      resetZoom: function(){
        this.map.setZoom(12);
      },

      fitBounds: function(places){
        if (places.length == 0)
          return;
        var place = places[0];        
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(place.geometry.location);
        this.map.fitBounds(bounds);        
      },

      loadGemeinde: function(name){
        var localUrl = 'assets/gemeinden/' + name + '.kml';
        var url = 'http://tiefenauer.github.io/m3d/' + localUrl;                  
        this.parser = new geoXML3.parser({
          map: this.map,
          afterParse: angular.bind(this, function(docs){              
            $scope.$broadcast('gemeinde:loaded', docs);
            if (this.doc)
              this.parser.hideDocument(this.doc);
            this.doc = docs[0];
            var polygon = this.doc.placemarks[0].Polygon[0];
            this.setPolygon(polygon);
          })
        });
        this.parser.parse(localUrl);
      },

      getRectBounds: function(){
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
      },

      setPolygon: function(polygon){
        if (polygon == null){
          if (this.polygon){
            this.polygon.setMap = this.polygon.setMap || function(){};
            this.polygon.setMap(null);
            this.polygon = null;
          }
          return;
        };

        if (this.rect){
          this.rect.setMap(null);
          this.rect = null;          
        } 
        if (this.polygon)
          this.setPolygon(null);      
        this.polygon = polygon; 
        this.polygon.setOptions = this.polygon.setOptions || function(options){};
        this.polygon.setOptions({
          draggable: true, editable: true ,
          strokeColor: '#ff0000',
          strokeWeight: 5
        });
        this._area = this.polygon;
      },

      setRect: function(rect){
        if (rect == null){
          if (this.rect){
            this.rect.setMap(null);
            this.rect = null;
          }
          return;
        };

        if (this.polygon){
          this.polygon.setMap(null);
          this.polygon = null;
        }                
        if (this.rect)
          this.setRect(null);
        this.rect = rect;
        this.rect.setBounds(this.getRectBounds());
        this._area = this.rect;
      }
    };

    return ['$scope', '$log', 'ElevationDataService', 'ProfileOutlineService', MapController];

});
