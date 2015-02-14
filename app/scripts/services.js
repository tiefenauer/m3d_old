'use strict';

define([
	 'angular'
	,'services/elevationdataservice'
	,'services/profileio'
	,'services/profileOutline'
	], 
	function (angular, ElevationDataService, ProfileIOService, ProfileOutlineService) {
	
	/* Services */

	angular.module('m3d.services', [])
		.service('ElevationDataService', ElevationDataService)
		.service('ProfileIOService', ProfileIOService)
		.service('ProfileOutlineService', ProfileOutlineService)
		.value('m3d.services.version', '0.1')
		.value('m3e.services.settings', {})
		;
});