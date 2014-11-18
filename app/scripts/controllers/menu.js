define([
  'angular',
  'jquery',
  'ladda-bootstrap'
  ],
   function (angular, $, Ladda) {
    'use strict';

    var $scope, $rootScope, $log, $modal;

    var searchBox, ladda;
    var buttonLabelDefault = 'Höhenprofil generieren';
    var buttonLabelProcessing = 'Abbrechen';  

    var MenuController = function ($rootScope, $scope, $log) {
      $log.debug('MenuController created');        
      $scope.buttonLabel = buttonLabelDefault;

      $scope.calculateHeightMap = calculateHeightMap;
      $scope.showInfo = showInfo;        
      $scope.showStats = showStats;        
      $scope.showFileUpload = showFileUpload;
      init($rootScope, $scope, $log);
    }

    //var google = google;
    /**
     * @ngdoc function
     * @name m3dApp.controller:MenuCtrl
     * @description
     * # MenuCtrl
     * Controller of the m3dApp
     */
     /*
    angular.module('m3dApp.controllers.MenuCtrl', [])
      .controller('MenuCtrl', MenuController);
      */

    var init = function(rootScope, scope, log){
      $rootScope = rootScope; 
      $scope = scope;
      $log = log;
      ladda = Ladda.create($('#ladda')[0]);

      $scope.$on('adapter:start', function(){
        ladda.start();
        $scope.$apply();
      });
      $scope.$on('adapter:queue:progress', function(event, data){
        ladda.setProgress(data.progress/data.total);
        $scope.prog = Math.round(100*data.progress/data.total);
        $scope.buttonLabel = buttonLabelProcessing + ' (' + $scope.prog + '%)';
        $log.debug($scope.prog + '% loaded');
        $scope.$apply();
      });
      $scope.$on('adapter:end', function(){
        ladda.stop();
        $scope.buttonLabel = buttonLabelDefault;
        $scope.prog = 0;
        $scope.$apply();
      });      

      initSearchBox();
    };

    var initSearchBox = function(){
      var searchInput = $('#pac-input')[0];
      searchBox = new google.maps.places.SearchBox(searchInput);
      google.maps.event.addListener(searchBox, 'places_changed', onPlacesChanged);
    };

    var onPlacesChanged = function(/* places */){
      $log.debug('menu:places_changed');
      $rootScope.$broadcast('menu:places_changed', searchBox.getPlaces());
    };    

    var showFileUpload = function(){
      var fileSelector = $('<input></input>').attr({type: 'file'});
      fileSelector.change(function(evt){
        var file = evt.target.files[0];
        if (file) {
          $rootScope.$broadcast('menu:loadProfile', file);          
        }        
      });
      fileSelector.click(); 
    };    

    var showStats = function(){
      $log.debug('showing stats...');
      $modal.open({
         templateUrl: 'templates/stats_popup.html'
        ,controller: 'StatsController'
      });
    };

    var showInfo = function(){
      $log.debug('showing info...');
      $modal.open({
         templateUrl: 'templates/info_popup.html'
        ,controller: 'InfoController'
      });
    };    

    var calculateHeightMap = function(){
      $log.debug('process button clicked');
      $rootScope.$broadcast('menu:process_button_clicked');
    };

    return MenuController;
});
