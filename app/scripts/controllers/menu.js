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
    var google = window.google;

    var MenuController = function ($rootScope, $scope, $log, $modal) {
      $log.debug('MenuController created');  
      init($rootScope, $scope, $log, $modal);
      $scope.buttonLabel = buttonLabelDefault;
      $scope.searchbox = { template:'searchbox.tpl.html'};

      $scope.calculateHeightMap = calculateHeightMap;
      $scope.showSettings = showSettings;
      $scope.showInfo = showInfo;        
      $scope.showStats = showStats;        
      $scope.showFileUpload = showFileUpload;
      $scope.saveModel = saveModel;      
    };

    /**
     * @ngdoc function
     * @name m3dApp.controller:MenuCtrl
     * @description
     * # MenuCtrl
     * Controller of the m3dApp
     */

    var init = function(rootScope, scope, log, modal){
      $rootScope = rootScope; 
      $scope = scope;
      $log = log;
      $modal = modal;
      ladda = Ladda.create($('#ladda')[0]);

      $scope.$on('adapter:start', function(){
        ladda.start();
      });
      $scope.$on('adapter:queue:progress', function(event, data){
        ladda.setProgress(data.progress/data.total);
        $scope.prog = Math.round(100*data.progress/data.total);
        $scope.buttonLabel = buttonLabelProcessing + ' (' + $scope.prog + '%)';
        $log.debug($scope.prog + '% loaded');
      });
      $scope.$on('adapter:end', function(){
        ladda.stop();
        $scope.buttonLabel = buttonLabelDefault;
        $scope.prog = 0;
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
      var fileSelector = $('<input></input>').attr({type: 'file', accept: '.stl,.wrl'});
      fileSelector.change(function(evt){
        var file = evt.target.files[0];
        if (file) {
          $rootScope.$broadcast('menu:loadProfile', file);          
        }        
      });
      fileSelector.click(); 
    };    

    var showSettings = function(){
      $log.debug('showing settings...');
      $modal.open({
         templateUrl: 'views/templates/settings_popup.html'
        ,controller: 'SettingsCtrl'
      });
    };

    var showStats = function(){
      $log.debug('showing stats...');
      $modal.open({
         templateUrl: 'views/templates/stats_popup.html'
        ,controller: 'StatsController'
      });
    };

    var showInfo = function(){
      $log.debug('showing info...');
      $modal.open({
         templateUrl: 'views/templates/info_popup.html'
        ,controller: 'InfoCtrl'
      });
    };    

    var calculateHeightMap = function(){
      $log.debug('process button clicked');
      $rootScope.$broadcast('menu:process_button_clicked');
    };

    var saveModel = function (event) {
      $log.debug('save button clicker');
      $rootScope.$broadcast('menu:save_button_clicked');
    };    

    return ['$rootScope', '$scope', '$log', '$modal', MenuController];
});
