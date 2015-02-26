'use strict';
define([
   'angular'
  ,'jquery'
  ,'lodash'
  ,'models/footprint' 
  ,'models/rectFootprint'
  ,'models/polyFootprint'
  ,'models/gemeindeFootprint'
  ,'vendor/geoxml3'
    /*
  ,'vendor/ProjectedOverlay'
  */
  ], 
  function (angular, $, _, Footprint, RectFootprint, PolyFootprint, GemeindeFootprint) {

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
          $ElevationDataService.getElevationData(this.footprint);
        }));
        $scope.$on('gemeinde:load', angular.bind(this, function(event, name){
          $log.debug('loading ' + name + ' from file...');
          this.loadGemeinde(name);
        }));
        $scope.$on('menu:drawing:type', angular.bind(this, function(event, type){
          if (type == 'rect')
            this.setFootprint(new RectFootprint());
          else if (type == 'poly')
            this.setFootprint(new PolyFootprint());
        }));
        //$scope.$broadcast('gemeinde:load', 'Aarau');        
    };

    MapController.prototype = /** @lends m3d.controller.MapController.prototype */{
      map: null,
      footprint: null,

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
          this.setFootprint(new RectFootprint());
          google.maps.event.removeListener(tilesLoadedListener);
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
            var footprint = new GemeindeFootprint();
            footprint.setShape(this.doc);
            this.setFootprint(footprint);
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

      setFootprint: function(footprint){        
        // bisherige Auswahl löschen
        if (this.footprint){
          // Rect/Polygon
          if (this.footprint instanceof Footprint && this.footprint.shape){
            this.footprint.shape.setMap(null);
            this.footprint.shape = null;            
          }
          // Gemeinde
          //if (this.footprint instanceof GemeindeFootprint && this.footprint.)
          this.footprint = null;
        };
              


        this.footprint = footprint;
        this.footprint.setMap(this.map);
      }

    };

    return ['$scope', '$log', 'ElevationDataService', 'ProfileOutlineService', MapController];

});
