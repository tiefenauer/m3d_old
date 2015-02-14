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

      this.isSet = function(checkTab){
        return this.tab === checkTab;
      };
      this.setTab = function(setTab){
        this.tab = setTab;
        this.updateList();
      };

      var _q = 'aar';
      $scope.search = {
        query: function(newQuery){
          $log.debug(newQuery);
          if (angular.isDefined(newQuery) && newQuery.length >= 3){
            _q = newQuery;
          }
          return _q;
        }
      };      

      $scope.close = close;
    };

    
    GemeindeController.prototype = /** @lends m3d.controller.GemeindeController.prototype */{
      tab: 'search',
      gemeinden: [],
      list: [],

      /**
      * initialize controller
      */
      init: function(rootScope, scope, log, modalInstance){
        $log = log;
        $scope = scope;
        $modalInstance = modalInstance;
        $rootScope = rootScope;

        $scope.load = function(gemeinde){          
          $rootScope.$broadcast('gemeinde:load', gemeinde);
          $modalInstance.close();
        };
        $scope.ok = $scope.cancel = function(){
          $modalInstance.close();
        };
        var ctrl = this;
        $.ajax({
          url: 'assets/gemeinden/gemeinden.json',
          success: function(data){
            ctrl.gemeinden = data;
            //ctrl.setTab('A');
            $scope.$apply();
          }
        });
      },

      updateList: function(){
        if (this.isSet('search')) {
          this.list = this.filter(this.gemeinden);
        }
        else {
          this.list = this.gemeinden;
        }
      },

      filter: function(gemeinden){
        if (this.query.length == 0)
          return [];

        return _.filter(gemeinden, function(name){
          return name.toUpperCase().substr(0,1) === this.tab;
        }, this);
      }

    };

    return ['$rootScope', '$scope', '$log', '$modalInstance', GemeindeController];
});
