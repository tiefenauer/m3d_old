define([
  'angular'
  ], 
  function (angular) {
  'use strict';

  var $log, $modalInstance, $scope;

  var InfoController = function($scope, $log, $modalInstance){
    $log.debug('StatsController created');
    init($scope, $log, $modalInstance);
    $scope.close = close;

    return {
       close: close
    };
  };

  var init = function(scope, log, modalInstance){
    $log = log;
    $scope = scope;
    $modalInstance = modalInstance;

    $scope.ok = angular.bind(this, $modalInstance.close);
  };

  return ['$scope', '$log', '$modalInstance', InfoController];
});
