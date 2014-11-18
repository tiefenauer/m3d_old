define([
	 'angular'
	,'services'
	,'controllers/menu'
	,'controllers/map'
	,'controllers/profile'
	], 
	function(angular, services, MenuController, MapController, ProfileController){

	'use strict';		

	/* Controllers */
	return angular.module('m3d.controllers', ['m3d.services'])
		.controller('MenuCtrl', MenuController)		
		.controller('MapCtrl', MapController)				
		.controller('ProfileCtrl', ProfileController)				
		;

});