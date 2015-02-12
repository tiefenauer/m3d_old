define([
	 'angular'
	,'services'
	,'controllers/menu'
	,'controllers/map'
	,'controllers/profile'
	,'controllers/info'
	,'controllers/settings'
	,'controllers/gemeinde'
	], 
	function(angular, services, MenuController, MapController, ProfileController, InfoController, SettingsController, GemeindeController){

	'use strict';		

	/* Controllers */
	return angular.module('m3d.controllers', ['m3d.services', 'ui.bootstrap'])
		.controller('MenuCtrl', MenuController)		
		.controller('MapCtrl', MapController)				
		.controller('ProfileCtrl', ProfileController)
		.controller('InfoCtrl', InfoController)		
		.controller('SettingsCtrl', SettingsController)		
		.controller('GemeindeCtrl', GemeindeController)
		;

});