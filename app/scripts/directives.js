define([
	 'angular'
	,'services'
	,'directives/m3dmenu'
	,'directives/m3dmap'
	,'directives/m3dprofile'
	], 
	function(angular, services, MenuDirective, MapDirective, ProfileDirective) {

		'use strict';

		/* Directives */
		angular.module('m3d.directives', ['m3d.services'])
			.directive('m3dMenu', MenuDirective)
			.directive('m3dProfile', ProfileDirective)
			.directive('m3dMap', MapDirective)
			.directive('appVersion', ['version', function(version) {
				return function(scope, elm, attrs) {
					elm.text(version);
			};
		}]);
});