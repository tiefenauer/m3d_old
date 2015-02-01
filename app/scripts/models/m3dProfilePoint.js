'use strict';
define([
	],
	function(){

	    /**
	     * ProfilePoint
	     * Model for a single point of the digital elevationProfile
	     * @class
	     * @name m3d.model.ProfilePoint
	     * @namespace
	     */
		var ProfilePoint = function(lat, lng, elv){
			this.lat = lat;
			this.lng = lng;
			this.elv = elv;
		};

		ProfilePoint.prototype =  /** @lends m3d.controller.MapController.prototype */{
			lat: 0,
			lng: 0,
			elv: 0
		};

		return ProfilePoint;
	});