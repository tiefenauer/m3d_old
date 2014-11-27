define([
  'angular'
  ], 
  function (angular) {
  'use strict';

  var $log, $modalInstance, $scope;

  var InfoController = function($scope, $log, $modalInstance){
    $log.debug('StatsController created')
    init($scope, $log, $modalInstance);

    return {
       close: close
    }
  };

  var init = function(scope, log, modalInstance){
    $log = log;
    $scope = scope;
    $modalInstance = modalInstance;

    addEventListeners();
  };

  var addEventListeners = function(){
    $scope.ok = angular.bind(this, close);
  };

  var close = function() {
      $modalInstance.close(null);
    };

  return ['$scope', '$log', '$modalInstance', InfoController];
});
