/* jslint unused: false */
'use strict';
define([
  'angular'
  ,'jquery'
  ,'jquery-ui'
  ], 
  function (angular, $) {

    var $rootScope, $log, $modalInstance, $scope;
    var fs, gemeindeDir;

    /**
     * GemeindeController
     * Controller for municipality popup
     * @class
     * @name m3d.controller.GemeindeController
     * @namespace
     * @constructor
     */
    var GemeindeController = function($rootScope, $scope, $log, $modalInstance){
      $log.debug('GemeindeController created');      
      this.init($rootScope, $scope, $log, $modalInstance);

      $scope.updateList = this.updateList;

      $scope.isSet = function(checkTab){
        return this.tab === checkTab;
      };
      $scope.setTab = function(setTab){
        $scope.query = '';
        this.tab = setTab;
        this.updateList();
      };

      $scope.query = '';
      $scope.search = {
        query: function(newQuery){
          if (angular.isDefined(newQuery)){
            $scope.query = newQuery;
          }
          return $scope.query;
        }
      };      

      $scope.close = close;
    };

    
    GemeindeController.prototype = /** @lends m3d.controller.GemeindeController.prototype */{
      tab: 'search',

      /**
      * initialize controller
      */
      init: function(rootScope, scope, log, modalInstance){
        $log = log;
        $scope = scope;
        $modalInstance = modalInstance;
        $rootScope = rootScope;

        $scope.gemeinden = {
          all: [],          
          list: function(){
            return [];
          }
        };
        $scope.list = [];

        $scope.load = function(gemeinde){          
          $rootScope.$broadcast('gemeinde:load', gemeinde);
          $modalInstance.close();
        };
        $scope.ok = $scope.cancel = function(){
          $modalInstance.close();
        };
        $.ajax({
          url: 'assets/gemeinden/gemeinden.json',
          success: function(data){
            $scope.gemeinden.all = data;
            $scope.setTab('search');
            $scope.$apply();
          }
        });
      },

      updateList: function(){
        if ($scope.isSet('search')) {
          $scope.gemeinden.list = $scope.gemeinden.all;
        }
        else {
          $scope.gemeinden.list = _.filter($scope.gemeinden.all, function(name){
            return name.toUpperCase().substr(0,1) === this.tab;
          }, this);
        }
      }

    };

    return ['$rootScope', '$scope', '$log', '$modalInstance', GemeindeController];
});
