define([
   'angular'
  ,'jquery'
  ], 
  function (angular, $) {
    'use strict';

    var $log, $scope;
    var elevationAdapter;
    var map, rect;
    var markers = [];
    var gridSize;
    var verticalSegments = 25;
    var horizontalSegments = 25;    

    //var google = google;

    var MapController = function ($scope, $log, elevationDataService) {
        $log.debug('MapController created');
        init($scope, $log);
        elevationAdapter = elevationDataService;
    };

    var init = function(scope, log){
      $scope = scope;
      $log = log;

      $scope.$on('menu:places_changed', onPlacesChanged);
      $scope.$on('menu:process_button_clicked', function(){
        elevationAdapter.calculateHeightMap(getProfilePoints());
      });
      initMap();
    };      

    var initMap = function(){
      var el = $('#map')[0];
      map = new google.maps.Map(el, {
        center : new google.maps.LatLng(45.976433, 7.658448), // Matterhorn
        zoom : 12,
        mapTypeId : google.maps.MapTypeId.ROADMAP,
        scrollwheel: true,
        zoomControl: true
      });

      google.maps.event.addListener(map, 'tilesloaded', function(){
        $log.debug('map:tilesloaded');
        initRect();
      });
      google.maps.event.addListener(map, 'bounds_changed', function(){
        $log.debug('map:bounds_changed : ' + map.getBounds().getSouthWest().lat() + ',' + map.getBounds().getSouthWest().lng() + '/' + map.getBounds().getNorthEast().lat() + ',' + map.getBounds().getNorthEast().lng());
        initRect();
      });
      //initRect();
    };  

    var initRect = function(){    
      if (rect){
        rect.setMap(null);
      }        
      rect = new google.maps.Rectangle({editable: true, draggable: true});
      rect.setMap(map);
      rect.setBounds(getRectBounds());      
      /*
      // Matterhorn
      new google.maps.LatLngBounds(   
        new google.maps.LatLng(45.956433, 7.63),
        new google.maps.LatLng(46, 7.7 )
      )
      */
    };

    var getRectBounds = function(){
      var mapBounds = map.getBounds();
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

    /**
    * Rasterize selection rectangle to determine points for which the elevation must be determined.
    * @return a ProfilePoint object with all the coordinates from the rasterized selection rectangle. The elevation is zero for each poitn.
    */
    var getProfilePoints = function(){
      var resolution = localStorage.getItem('resolution') || 25;
      gridSize = horizontalSegments = verticalSegments = parseInt(resolution);

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
          profilePoints.push({lng: Number(parseFloat(xVal).toFixed(4)), lat: Number(parseFloat(yVal).toFixed(4))});
        }
      }
      return profilePoints;
    };    

    var onPlacesChanged = function(event, places){
      $log.debug('onPlacesChanged' + places.length);

      markers.forEach(function(marker){
        marker.setMap(null);
      });

      // For each place, get the icon, place name, and location.
      markers = [];
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i<places.length; i++) {
        var place = places[i];
        var image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location
          });

          markers.push(marker);

          bounds.extend(place.geometry.location);
      }

      map.fitBounds(bounds);
    };

    /**
     * @ngdoc function
     * @name m3dApp.controller:MapCtrl
     * @description
     * # MapCtrl
     * Controller of the m3dApp
     */
    angular.module('m3dApp.controllers.MapCtrl', ['m3dApp.services.Elevationdataservice'])
      .controller('MapCtrl', ['$scope', '$log', 'ElevationDataService', MapController]);

});
