define([
	  'angular'
	 ,'decorators/log'
	], 
	function(angular, Logger){

	'use strict';		

	/* Controllers */
	angular.module('m3d.decorators', [])
      .config(['$provide', function ($provide) {
        $provide.decorator('$log', ['$delegate', Logger]);
    }]);

});