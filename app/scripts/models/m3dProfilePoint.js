'use strict';
define([
	],
	function(){

    /**
     * ProfilePoint
     * Model for a single point of the digital elevationProfile
     * @class
     * @module models/m3dProfilePoint
     * @name m3d.models.ProfilePoint
     * @namespace
     * @constructor
     */
		var ProfilePoint = function(){
			var options = arguments.length > 0?arguments[0]:{};
			var defaultArgs = {
				'lat': 0,
				'lng': 0,
				'elv': 0,
        'topVertex': null,
        'bottomVertex': null
			};
			for(var index in defaultArgs){
				if (typeof options[index] == 'undefined') options[index] = defaultArgs[index];
			}
			this.init(options);
		};

		ProfilePoint.prototype =  /** @lends m3d.models.ProfilePoint.prototype */{
			lat: 0,
			lng: 0,
			elv: 0,
      topVertex: null,
      bottomVertex: null,

			/*
			* initialize the ProfilePoint with an options object
			* @param {Object} options options object
			*/
			init: function(options){
				this.lat = options.lat;
				this.lng = options.lng;
				this.elv = options.elv;
        this.topVertex = options.topVertex;
        this.bottomVertex = options.bottomVertex;
			}
		};

		return ProfilePoint;
	});