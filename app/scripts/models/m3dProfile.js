define([
	 'angular'
	,'lodash'
	,'models/m3dProfilePoint'
	,'util/GoogleMapsUtil'
	,'util/ProfileUtil'
	],
	function(angular, _, ProfilePoint, gmUtil, ProfileUtil){

    /**
     * Profile
     * Model for virtual elevation model
     * @class
     * @name m3d.model.Profile
     * @namespace
     * @constructor
     */
		var Profile = function(){
			var options = {};
			if (arguments[0]) options = arguments[0];
			var defaultArgs = {
				'profilePoints': [],
				'footprint': null,
				'thickness': localStorage.getItem('thickness') || 200,
				'mesh': null,
				'name': null
			};
			for(var index in defaultArgs){
				if (typeof options[index] == 'undefined') options[index] = defaultArgs[index];
			}
			this.init(options);
		};

		Profile.prototype = /** @lends m3d.model.Profile.prototype */{
		  name: '',
		  profilePoints: [],
		  footprint: null,
		  thickness: 0,
		  mesh: null,
		  mold: null,

		  /**
		  * initialize the object
		  * @param {Object} options configuration options
		  */ 
		  init: function(options){		  			  	
		  	this.footprint = options.footprint;
				this.thickness = options.thickness;		  	
				this.name = options.name?options.name:'profile_' + Math.floor(Math.random()*100);
				this.mesh = options.mesh;
				this.profilePoints = _.sortByAll(options.profilePoints, ['lat', 'lng']);
				if(this.mesh)
					this.mesh.name = this.name;
		  },

		  /**
		  * Get minimum longitude
		  * @return {Number} minimum value of all longitudes
		  */
		  getMinLng: function(){
		  	return ProfileUtil.getMinLng(this.profilePoints);
		  },
		  /**
		  * Get maximum longitude
		  * @return {Number} maximum value of all longitudes
		  */
		  getMaxLng: function(){
		  	return ProfileUtil.getMaxLng(this.profilePoints);
		  },
		  /**
		  * Get minimum latitude
		  * @return {Number} minimum value of all latitudes
		  */
		  getMinLat: function(){
				return ProfileUtil.getMinLat(this.profilePoints);
		  },
		  /**
		  * Get maximum latitude
		  * @return {Number} maximum value of all latitudes
		  */
		  getMaxLat: function(){
		  	return ProfileUtil.getMaxLat(this.profilePoints);
		  },
		  /*
		  * Get minimum elevation
		  * @return {Number} maximum value of all elevations
		  */
		  getMinElv: function(){
				return ProfileUtil.getMinElv(this.profilePoints);
		  },
		  /**
		  * Get maximum elevation
		  * @return {Number} maximum value of all elevations
		  */
		  getMaxElv: function(){
		  	return ProfileUtil.getMaxElv(this.profilePoints);
		  },
		  /**
		  * Get the model width as the distance between the easternmost and the westermost point
		  * @return {Number} the distance between the easternmost and the westermost point in meters
		  */
		  getDistanceX: function(){
		  	var nw = {'lat': this.getMaxLat(), 'lng': this.getMinLng()};
		  	var ne = {'lat': this.getMaxLat(), 'lng': this.getMaxLng()};
		  	return Math.floor(gmUtil.degreeToMeter(nw, ne));
		  },
		  /**
		  * Get the model depth (length) as the distance between te southernmost and the northernmost point
		  * @return {Number} the distance between the southernmost and the northernmost point in meters
		  */
		  getDistanceZ: function(){
		  	var sw = {'lat': this.getMinLat(), 'lng': this.getMinLng()};	
		  	var nw = {'lat': this.getMaxLat(), 'lng': this.getMinLng()};
		  	return Math.floor(gmUtil.degreeToMeter(sw, nw));
		  },

		  /**
		  * Get the model height as the distance between the lowest and the highest point
		  * @return {Number} the distance between the lowest and the highest point in meters
		  */
		  getDistanceY: function(){
		  	return this.getMaxElv() - this.getMinElv();
		  },

		  /**
		  * Get the model width as the unitless distance between the outermost points on the X-axis
		  * @return {Number} the model width as the difference between the two X-coordinates
		  */
		  getDimensionX: function(){
		  	var xs = _.pluck(this.mesh.geometry.vertices, 'x');
		  	var maxX = _.max(xs);
		  	var minX = _.min(xs);
		  	return Math.floor(Math.abs(maxX - minX));
		  },

		 /**
		  * Get the model height as the unitless distance between the outermost points on the Y-axis
		  * @return {Number} the model height as the difference between the two Y-coordinates
		  */
		  getDimensionY: function(){
			var ys = _.pluck(this.mesh.geometry.vertices, 'y');
		  	var maxY = _.max(ys);
		  	var minY = _.min(ys);
		  	return Math.floor(Math.abs(maxY - minY));
		  },

		 /**
		  * Get the model depth as the unitless distance between the outermost points on the Z-axis
		  * @return {Number} the model width as the difference between the two Z-coordinates
		  */
		  getDimensionZ: function(){
			var zs = _.pluck(this.mesh.geometry.vertices, 'z');
		  	var maxZ = _.max(zs);
		  	var minZ = _.min(zs);
		  	return Math.floor(Math.abs(maxZ - minZ));
		  },

	};

	return Profile;
});