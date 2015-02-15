/* jslint unused: false */
'use strict';
define([
  'angular'
  ,'jquery-ui'
  ], 
  function (angular) {

    var $log, $modalInstance, $scope;
    var $resolutionSlider, $thicknessSlider;

    /**
     * SettingsController
     * Model for virtual elevation model
     * @class
     * @name m3d.controllers.SettingsController
     * @namespace
     * @constructor
     */
    var SettingsController = function(scope, log, modalInstance){
      $scope = scope;
      $log = log;
      $modalInstance = modalInstance;      
      $log.debug('SettingsController created');

      $scope.mockCallsEnabled = localStorage.getItem('mockCallsEnabled') === 'true' || false;
      $scope.resolution = parseInt(localStorage.getItem('resolution')) || 25;
      $scope.thickness = parseInt(localStorage.getItem('thickness')) || 2;
      $scope.resolutionSlider = { min: 1, max: 100, step: 1 };
      $scope.thicknessSlider = { min: 1, max: 400, step: 1 };

      $scope.setResolution = function(res){
        $scope.resolution = res;
      };

      $scope.ok = function(){
        localStorage.setItem('resolution', $scope.resolution);
        localStorage.setItem('mockCallsEnabled', $scope.mockCallsEnabled);  
        localStorage.setItem('thickness', $scope.thickness);
        $modalInstance.close(null);
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    };

    return ['$scope', '$log', '$modalInstance', SettingsController];
});
