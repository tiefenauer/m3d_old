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

      $scope.close = close;
    };

    
    GemeindeController.prototype = /** @lends m3d.controller.GemeindeController.prototype */{

      tab: 'A',
      gemeinden: [],
      list: [],
      q: '',

      /**
      * initialize controller
      */
      init: function(rootScope, scope, log, modalInstance){
        $log = log;
        $scope = scope;
        $modalInstance = modalInstance;
        $rootScope = rootScope;

        $scope.load = this.load;
        var ctrl = this;
        $.ajax({
          url: 'assets/gemeinden/gemeinden.json',
          success: function(data){
            ctrl.gemeinden = data;
            ctrl.setTab('A');
            $scope.$apply();
          }
        });
      },

      updateList: function(){
        if (this.q.length == 0){
          this.list = _.filter(this.gemeinden, function(name){
            return name.toUpperCase().substr(0,1) === this.tab;
          }, this);                  
        }
        else {
          this.list = this.gemeinden;
        }
      },

      load: function(gemeinde){
        $log.debug("loading " + gemeinde);
        $.ajax({
          url: 'assets/gemeinden/' + gemeinde + '.kml',
          success: function(data){
            $log.debug('done: ' + data);
            $rootScope.$broadcast('gemeinde:loaded', data);
          }
        });
      }

    };

    var fsInit = function(fsObj){
      console.log('Opened file system: ' + fsObj.name);
      fs = fsObj;
      var dirReader = fs.root.createReader();
      var entries = [];
      var readEntries = function(){
        dirReader.readEntries(function(results){
          if (!results.length){
            $log.debug('directory read finished')
          }
          else{
            $log.debug('read ' + results.length + ' entries');
            readEntries();
          }
        });
      };
      readEntries();
      fs.root.getDirectory('bliblablu', {create: true}, function(dirEntry){
        gemeindeDir = dirEntry;
      }, fsError);
    };

    var fsError = function(e) {
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      };

      console.log('Error: ' + msg);
    };

    return ['$rootScope', '$scope', '$log', '$modalInstance', GemeindeController];
});
