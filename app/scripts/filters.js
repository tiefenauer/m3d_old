define([
	'angular', 
	'services'
	], 
	function (angular, services) {

	'use strict';

	var InterpolateFilter = function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		}
	}

	/* Filters */
	angular.module('m3d.filters', ['m3d.services'])
		.filter('m3d.filter.interpolate', ['m3d.services.version', InterpolateFilter]);
});