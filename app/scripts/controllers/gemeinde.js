/* jslint unused: false */
'use strict';
define([
  'angular'
  ,'jquery'
  ,'jquery-ui'
  ], 
  function (angular, $) {

    var $log, $modalInstance, $scope, $rootScope;
    var fs, gemeindeDir;

    /**
     * GemeindeController
     * Controller for municipality popup
     * @class
     * @name m3d.controller.GemeindeController
     * @namespace
     * @constructor
     */
    var GemeindeController = function(rootScope, scope, log, modalInstance){
      $log = log;
      $scope = scope;
      $modalInstance = modalInstance;
      $rootScope = rootScope;
      $log.debug('GemeindeController created');      

      $scope.query = '';
      $scope.gemeinden = {
        all: [],          
        list: function(){
          return [];
        }
      };

      $scope.updateList = this.updateList;

      $scope.load = function(gemeinde){          
        $rootScope.$broadcast('gemeinde:load', gemeinde);
        $modalInstance.close();
      };
      $scope.isSet = function(checkTab){
        return this.tab === checkTab;
      };
      $scope.setTab = function(setTab){
        $scope.query = '';
        this.tab = setTab;
        this.updateList();
      };

      $scope.ok = $scope.cancel = function(){
        $modalInstance.close();
      };
      
      $scope.search = {
        query: function(newQuery){
          if (angular.isDefined(newQuery)){
            $scope.query = newQuery;
          }
          return $scope.query;
        }
      };      
      this.init();
    };

    
    GemeindeController.prototype.tab = 'search';

    GemeindeController.prototype.init = function(){
      $.ajax({
        url: 'assets/gemeinden/gemeinden.json',
        success: function(data){
          $scope.gemeinden.all = data;
          $scope.setTab('search');
          $scope.$apply();
        }
      });
    };

    GemeindeController.prototype.updateList = function(){
      if ($scope.isSet('search')) {
        $scope.gemeinden.list = $scope.gemeinden.all;
      }
      else {
        $scope.gemeinden.list = _.filter($scope.gemeinden.all, function(name){
          return name.toUpperCase().substr(0,1) === this.tab;
        }, this);
      }
    };

    return ['$rootScope', '$scope', '$log', '$modalInstance', GemeindeController];
});
