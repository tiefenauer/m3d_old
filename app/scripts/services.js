'use strict';

define([
	 'angular'
	,'services/elevationdataservice'
	], 
	function (angular, ElevationDataService) {
	
	/* Services */

	angular.module('m3d.services', [])
		.service('ElevationDataService', ElevationDataService)
		.value('m3d.services.version', '0.1')
		.value('m3e.services.settings', {})
		;
});