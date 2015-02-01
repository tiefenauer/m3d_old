/* jslint unused: false */
'use strict';
define([
  'angular'
  ,'jquery-ui'
  ], function (angular) {

  var $log, $modalInstance, $scope;
  var $resolutionSlider, $thicknessSlider;

  var SettingsController = function($scope, $log, $modalInstance){
    $log.debug('SettingsController created');
    init($scope, $log, $modalInstance);

    $scope.close = close;
    $scope.mockCallsEnabled = localStorage.getItem('mockCallsEnabled') === 'true' || false;
    $scope.resolution = parseInt(localStorage.getItem('resolution')) || 25;
    $scope.thickness = parseInt(localStorage.getItem('thickness')) || 2;
    $scope.resolutionSlider = {        
      min: 1,
      max: 100,
      step: 1
    };
    $scope.thicknessSlider = {
      min: 1,
      max: 20,
      step: 1
    };
    $scope.setResolution = function(res){
      $scope.resolution = res;
    };


    return {
       showSettings: showSettings
      ,close: close
      ,cancel: cancel
    };
  };

  var init = function(scope, log, modalInstance){
    $log = log;
    $scope = scope;
    $modalInstance = modalInstance;

    addEventListeners();
  };

  var addEventListeners = function(){
    $scope.ok = angular.bind(this, close);
    $scope.cancel = angular.bind(this, cancel);
  };

  var close = function() {
    localStorage.setItem('resolution', $resolutionSlider.slider('value'));
    localStorage.setItem('mockCallsEnabled', $scope.mockCallsEnabled);  
    localStorage.setItem('thickness', $thicknessSlider.slider('value'));
      $modalInstance.close(null);
  };

  var cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  var showSettings = function(){
    $log.debug('showing settings');
  };

  return ['$scope', '$log', '$modalInstance', SettingsController];
});