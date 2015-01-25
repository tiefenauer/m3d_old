define([
  'angular',
  'jquery',
  'lodash'  
  ], 
  function (angular, $, _) {
    'use strict';

    var google = window.google;
    var $log, $rootScope;
    var stop;

    var ElevationDataService = function($log, $rootScope){
      $log.debug('HeightMapService created');
      init($log, $rootScope);

      this.calculateHeightMap = calculateHeightMap
      this.DELAY = 1010;
      this.CHUNK_SIZE = 150;
    };
    


    var init =function(log, rootScope){
      $log = log;
      $rootScope = rootScope;
    };

    var calculateHeightMap = function(coordinates){
      $log.debug('calculating heigth map in service ...');
      $log.debug(coordinates.length + ' points');

      var service = new google.maps.ElevationService();

      // Koordinaten-Array aufsplitten (max 512 coordinates pro request)
      var delay = 1010;

      var chunkSize = 150;
      var requestQueue = [];
      for(var i=0; i<coordinates.length; i+=chunkSize){
        requestQueue.push(coordinates.slice(i, i+chunkSize));
      }
      
      $rootScope.$broadcast('adapter:start', {
         numItems: coordinates.length
        ,numCalls: requestQueue.length
        ,chunkSize: chunkSize
        ,delay: delay
      });
      
      stop = false;
      var index = 0;
      var queueItem;
      // Queue-Item abarbeiten
      var processNextQueueItem = function(){
        if (stop || index >= requestQueue.length){
          stop = false;
          $rootScope.$broadcast('adapter:end', coordinates);
        }
        else{
          queueItem = requestQueue[index];
          var request = {locations: queueItem};
          service.getElevationForLocations(request, onServiceResponse);           
        }
      };

      // Response handler
      var onServiceResponse = function(result, status){
        $rootScope.$broadcast('adapter:queue:progress', {
           status: status
          ,progress: index+1
          ,total: requestQueue.length
        });
        switch(status){
          case google.maps.ElevationStatus.OK:              

            $.each(queueItem, function(i, coord){              
              var searchResult = $.grep(result, function(entry, index){
                var lat = Number(parseFloat(entry.location.lat())).toFixed(4);
                var lng = Number(parseFloat(entry.location.lng())).toFixed(4);
                return lat == coord.lat && lng == coord.lng;
              });
              if (searchResult && searchResult.length > 0){
                $rootScope.$broadcast('adapter:item:progress');
                coord.elv = searchResult[0].elevation;
              }                
            });

            stop = ++index >= requestQueue.length
            processNextQueueItem();
          break;

          default:
            setTimeout(processNextQueueItem, 1000);
          break;
        }
        
      };

      processNextQueueItem();
    };

    return ElevationDataService;
    /**
     * @ngdoc service
     * @name m3dApp.Elevationdataservice
     * @description
     * # Elevationdataservice
     * Service in the m3dApp.
     */
     /*
    angular.module('m3d.services.ElevationDataService', [])
  	.service('ElevationDataService', ElevationDataService);
    */
});
