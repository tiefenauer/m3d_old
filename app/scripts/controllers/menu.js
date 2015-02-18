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

    /**
     * MenuController
     * Controller for menu
     * @class
     * @name m3d.controller.MenuController
     * @namespace
     * @constructor
     */
    var MenuController = function ($rootScope, $scope, $log, $modal) {
      $log.debug('MenuController created');  
      this.init($rootScope, $scope, $log, $modal);

      $scope.loadModel = this.loadModel;
      $scope.saveModel = this.saveModel;
      $scope.popup = this.popup;
      $scope.generateProfile = function(){
        $log.debug('process button clicked');
        $rootScope.$broadcast('menu:model:generate');
      };
      $scope.showSettings = function(){
        this.popup('views/templates/settings_popup.html', 'SettingsCtrl');
      },
      $scope.showInfo = function(){
        this.popup('views/templates/info_popup.html', 'InfoCtrl');
      };        
      $scope.showStats = function(){
        this.popup('views/templates/stats_popup.html', 'StatsController');
      };        
      $scope.showTownList = function(){
        this.popup('views/templates/gemeinde_popup.html', 'GemeindeCtrl', 'lg');
      };
      $scope.setDrawingType = function(type){
        $scope.drawingType = type;
        $scope.$broadcast('menu:drawing:type', type);
      };
    };

    MenuController.prototype = /** @lends m3d.controller.MenuController.prototype */{

      /**
      * initialize menu
      */
      init: function(rootScope, scope, log, modal){        
        $rootScope = rootScope; 
        $scope = scope;
        $log = log;
        $modal = modal;
        ladda = Ladda.create($('#ladda')[0]);

        $scope.buttonLabel = buttonLabelDefault;
        $scope.searchbox = { template:'searchbox.tpl.html'};        

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

        $scope.invertModel = function(){
          $log.debug('inverting model');
          $rootScope.$broadcast('menu:model:invert');
        };

        initSearchBox();
      },

      popup: function(template, controller, size){
        $log.debug('showing popup: ' + template);
        $modal.open({
           templateUrl: template
          ,controller: controller
          ,size: size
        })
      },

      /**
      * load model from file
      */
      loadModel: function(){
        var fileSelector = $('<input></input>').attr({type: 'file', accept: '.stl,.wrl'});
        fileSelector.change(function(evt){
          var file = evt.target.files[0];
          if (file) {
            $rootScope.$broadcast('menu:model:load', file);          
          }        
        });
        fileSelector.click(); 
      },

      /**
      * save model to file
      */
      saveModel: function () {
        $log.debug('save button clicked');
        $rootScope.$broadcast('menu:model:save');
      },

    };

    var initSearchBox = function(){
      var searchInput = $('#pac-input')[0];
      searchBox = new google.maps.places.SearchBox(searchInput);
      google.maps.event.addListener(searchBox, 'places_changed', function(/* places */){
        $log.debug('menu:places:changed');
        $rootScope.$broadcast('menu:places:changed', searchBox.getPlaces());
      });
    };

    return ['$rootScope', '$scope', '$log', '$modal', MenuController];
});
