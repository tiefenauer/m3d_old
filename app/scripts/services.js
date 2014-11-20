'use strict';

define([
	 'angular'
	,'services/elevationdataservice'
	,'services/profileio'
	], 
	function (angular, ElevationDataService, ProfileIOService) {
	
	/* Services */

	angular.module('m3d.services', [])
		.service('ElevationDataService', ElevationDataService)
		.service('ProfileIOService', ProfileIOService)
		.value('m3d.services.version', '0.1')
		.value('m3e.services.settings', {})
		;
});