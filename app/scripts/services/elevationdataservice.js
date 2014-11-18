define([
  'angular',
  'jquery',
  'lodash'  
  ], 
  function (angular, $, _) {
    'use strict';

    var google;
    var $log, $rootScope;
    var stop;

    var ElevationDataService = function($log, $rootScope){
      $log.debug('HeightMapService created');
      init($log, $rootScope);

      return {
        calculateHeightMap: calculateHeightMap
      };
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
      var delay = 1000;

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
      // Queue-Item abarbeiten
      var processNextQueueItem = function(){
        if (stop){
          stop = false;
        }
        else{
          var request = {locations: requestQueue[index]};
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

            $.each(result, function(i){
              $rootScope.$broadcast('adapter:item:progress');
              var searchResult = _.findWhere(coordinates, { 
                          lat: Number(parseFloat(result[i].location.lat()).toFixed(4)), 
                          lng: Number(parseFloat(result[i].location.lng()).toFixed(4))
                        });
              if (searchResult){
                searchResult.elv = result[i].elevation;
              }                
            });

            if (++index < requestQueue.length){           
              processNextQueueItem();
            }
            else{
              stop = false;
              $rootScope.$broadcast('adapter:end', coordinates);
            }
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
