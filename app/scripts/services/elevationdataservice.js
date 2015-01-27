define([
  'angular',
  'jquery',
  'lodash'  
  ], 
  function (angular, $, _) {
    'use strict';

    var google = window.google;
    var service, coords;
    var $log, $rootScope;
    var stop, index, requestQueue, queueItem;

    /**
     * ElevationDataService
     * Default Service to get elevation data from Google
     * @class
     * @name m3d.services.ElevationDataService 
     */
    var ElevationDataService = function($log, $rootScope){
      $log.debug('HeightMapService created');
      this.init($log, $rootScope);
    };
    

    ElevationDataService.prototype = /** @lends m3d.services.ElevationDataService.prototype */ {
      /** 
      * Default delay between service calls in ms 
      * @static 
      */
      DELAY: 1010,
      /** 
      * Number of coordinates to process in one go
      * @static 
      */
      CHUNK_SIZE: 150,

      /**
      * initialize Service
      */
      init: function(log, rootScope){
        $log = log;
        $rootScope = rootScope;
      },

      /**
      * Calculate a height map from a list of coordinates
      * @param {Object[]} coordinates list of coordinates to process      
      * @fires adapter:start
      * @fires adapter:end
      * @fires adapter:queue:progress
      */
      calculateHeightMap: function(coordinates){
        $log.debug('calculating heigth map in service ...');
        $log.debug(coordinates.length + ' points');
        coords = coordinates;

        service = new google.maps.ElevationService();

        // Koordinaten-Array aufsplitten (max 512 coordinates pro request)
        var delay = 1010;

        var chunkSize = 150;
        requestQueue = [];
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
        index = 0;
        processNextQueueItem();        
      }
    };

    // Queue-Item abarbeiten
    var processNextQueueItem = function(){
      if (stop || index >= requestQueue.length){
        stop = false;
        $rootScope.$broadcast('adapter:end', coords);
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


    return ElevationDataService;
});

/**
* Adapter start event.
* This event indicates the start of processing a number of coordinates
* @event adapter:start
* @property {Number} numItems number of coordinates that are going to be processed
* @property {Number} numCalls number of calls that are going to be made to get elevation data
* @property {Number} chunkSize number of coordinates processed in one go
* @property {Number} delay delay between service calls in ms
*/

/**
* Adapter progress event.
* This event indicates a progress while processing a number of coordinates
* @event adapter:queue:progress
* @property {Number} status Status response of last service call
* @property {Number} progress number of calls made
* @property {Number} total number of calls to be made
*/

/**
* Adapter end event.
* This event indicates the end of processing a number of coordinates
* @event adapter:end
* @property {Object[]} coords the processed coordinates including their elevation
*/