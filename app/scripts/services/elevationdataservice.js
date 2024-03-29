define([
  'angular'
  ,'jquery'
  ,'lodash'
  ,'models/m3dProfilePoint'
  ,'models/m3dProfile'
  ], 
  function (angular, $, _, ProfilePoint, Profile) {
    'use strict';

    var google = window.google;
    var service;
    var $log, $rootScope;
    var stop, index, requestQueue, queueItem;
    var footprint, profilePoints;

    /**
     * ElevationDataService
     * Default Service to get elevation data from Google
     * @class
     * @name m3d.services.ElevationDataService 
     */
    var ElevationDataService = function(log, rootScope){      
      $log = log;
      $rootScope = rootScope;
      $log.debug('HeightMapService created');
    };
    
    /** 
      * Default delay between service calls in ms 
      * @static 
      */
    ElevationDataService.prototype.DELAY = 1010;

    /** 
    * Number of coordinates to process in one go
    * @static 
    */
    ElevationDataService.prototype.CHUNK_SIZE = 150;

    ElevationDataService.prototype.footprint = null;

    ElevationDataService.prototype.coordinates = [];

    /**
    * Calculate a height map from a list of coordinates
    * @param {m3d.models.ProfilePoint[]} coordinates list of coordinates to process      
    * @fires adapter:start
    * @fires adapter:end
    * @fires adapter:queue:progress
    */
    ElevationDataService.prototype.getElevationData = function(_footprint){
      footprint = _footprint;
      profilePoints = footprint.getProfilePoints();        
      $log.debug('getting elevation data for ' + profilePoints.length + ' points');

      service = new google.maps.ElevationService();

      // Koordinaten-Array aufsplitten (max 512 coordinates pro request)
      var delay = 1010;

      var chunkSize = 150;
      requestQueue = [];
      for(var i=0; i<profilePoints.length; i+=chunkSize){
        requestQueue.push(profilePoints.slice(i, i+chunkSize));
      }
      
      $rootScope.$broadcast('adapter:start', {
         numItems: profilePoints.length
        ,numCalls: requestQueue.length
        ,chunkSize: chunkSize
        ,delay: delay
      });
      
      stop = false;
      index = 0;
      processNextQueueItem();        
    };

    /**
    * Get elevation data for next chunk in queue
    */
    var processNextQueueItem = function(){
      if (stop || index >= requestQueue.length){
        stop = false;
        footprint.setProfilePoints(profilePoints);
        $rootScope.$broadcast('adapter:end', footprint);
      }
      else{
        queueItem = requestQueue[index];
        var request = {locations: queueItem};
        service.getElevationForLocations(request, onServiceResponse);
      }
    };    

    /**
    * Respone handler
    */
    var onServiceResponse = function(result, status){
      $rootScope.$broadcast('adapter:queue:progress', {
         status: status
        ,progress: index+1
        ,total: requestQueue.length
      });
      switch(status){
        case google.maps.ElevationStatus.OK:              

          $.each(queueItem, function(i, profilePoint){              
            var searchResult = $.grep(result, function(entry, index){
              var lat = Number(parseFloat(entry.location.lat())).toFixed(4);
              var lng = Number(parseFloat(entry.location.lng())).toFixed(4);
              return lat == profilePoint.lat && lng == profilePoint.lng;
            });
            if (searchResult && searchResult.length > 0){
              $rootScope.$broadcast('adapter:item:progress');
              profilePoint.elv = searchResult[0].elevation;
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

    return ['$log', '$rootScope', ElevationDataService];
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