define([
	 'angular'
	,'services'
	,'directives/m3dmenu'
	,'directives/m3dmap'
	,'directives/m3dprofile'
	,'directives/m3dslider'
	], 
	function(angular, services, MenuDirective, MapDirective, ProfileDirective, SliderDirective) {

		'use strict';

		/* Directives */
		angular.module('m3d.directives', ['m3d.services'])
			.directive('m3dMenu', MenuDirective)
			.directive('m3dProfile', ProfileDirective)
			.directive('m3dMap', MapDirective)
			.directive('m3dSlider', SliderDirective)
			.directive('appVersion', ['version', function(version) {
				return function(scope, elm) {
					elm.text(version);
			};
		}]);
});