define([
	'lodash'
	,'models/m3dProfilePoint'
	,'util/GoogleMapsUtil'
	],
	function(_, ProfilePoint, gmUtil){

	    /**
	     * Profile
	     * Model for virtual elevation model
	     * @class
	     * @name m3d.model.Profile
	     * @namespace
	     */
		var Profile = function(profilePoints, thickness){
			var options = {};
			if (arguments[0]) options = arguments[0];
			var defaultArgs = {
				'profilePoints': [],
				'thickness': 200,
				'mesh': null
			};
			for(var index in defaultArgs){
				if (typeof options[index] == 'undefined') options[index] = defaultArgs[index];
			}
			this.init(options);
		};

		Profile.prototype = /** @lends m3d.model.Profile.prototype */{
		  name: '',
		  profilePoints: [],
		  thickness: 0,
		  segmentsX: 0,
		  segmentsY: 0,
		  mesh: null,
		  mold: null,

		  /**
		  * initialize the object
		  * @param {Object} options configuration options
		  */ 
		  init: function(options){
		  	this.profilePoints = options.profilePoints;
		  	this.thickness = options.thickness;
		  	this.mesh = options.mesh;
			this.segmentsX =  Math.sqrt(this.profilePoints.length) - 1;
			this.segmentsY =  Math.sqrt(this.profilePoints.length) - 1;		  	
			if (this.profilePoints.length > 0){				
				this.updateMesh(this.profilePoints);
			}
			else if (this.mesh){
				//this.updateProfilePoints(this.mesh);
				//this.updateMesh(this.profilePoints);
			}
			this.name = this.mesh.id;				
		  },

		  /**
		  * update mesh according to given ProfilePoints
		  * @param {m3d.model.ProfilePoint[]} profilePoints array of ProfilePoints to create the mesh
		  */
		  updateMesh: function(profilePoints){
		  	var geometry = new THREE.BoxGeometry(this.thickness, this.getDimensionZ(), this.getDimensionX(), 1, this.segmentsX, this.segmentsY);
		  	var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true });
		  	var mesh = new THREE.Mesh(geometry, material);
		  	mesh.geometry.dynamic = true;

	  	    var rotationZ = new THREE.Matrix4().makeRotationZ( - Math.PI/2 );
		    var rotationX = new THREE.Matrix4().makeRotationX( Math.PI );
			mesh.updateMatrix();
		    mesh.geometry.applyMatrix(mesh.matrix);
		    mesh.geometry.applyMatrix(rotationZ);
		    mesh.geometry.applyMatrix(rotationX);
		    mesh.matrix.identity();

			var diff = 0;

			//model.geometry.vertices.length
			_.forEach(this.profilePoints, function(point, i){
				diff = point.elv - this.getMinElv();         
				var bottomIndex = this.getBottomIndex(i);
				mesh.geometry.vertices[i].y += diff; 
				mesh.geometry.vertices[bottomIndex].y += diff;				
			}, this);

			mesh.geometry.computeFaceNormals();
			mesh.geometry.computeVertexNormals();
			this.mesh = mesh;
		  },

		  /**
		  * update profile points according to given mesh
		  * @param {THREE.Mesh} mesh mesh to be used to create ProfilePoints
		  */
		  updateProfilePoints: function(mesh){
		  	var profilePoints = [];
		  	var topPoints = mesh.geometry.vertices.splice(0, Math.ceil(mesh.geometry.vertices.length / 2));
		  	_.forEach(topPoints, function(vertex, i){
		  		var lat = vertex.x;
		  		var lng = vertex.y;
		  		var elv = vertex.z;
		  		var profilePoint = new ProfilePoint(lat, lng, elv);
		  		profilePoints.push(profilePoint);
		  	});
		  	/*
		  	mesh.geometry.vertices.forEach(function(vertex){
		  		// Vertices mit gleichen Koordinaten, aber unterschiedlicher Höhe suchen
		  		var pointPair = _.filter(mesh.geometry.vertices, {'x': vertex.x, 'z': vertex.z});
		  		// Vertex mit grösserer Höhe (=Vertex auf der Oberfläche) suchen und
		  		var topPoint = _.filter(pointPair, function(point){ return point.y == _.max(_.pluck(pointPair, 'y'))});
		  		// Prüfen, ob bereits ein Vertex mit denselben Koordinaten hinzugefügt wurde. Es darf nur der obere Vertex hinzugefügt werden!	  			
		  		var exists = typeof _.find(topPoints, {'x': topPoint[0].x, 'z': topPoint[0].y}) != 'undefined';		  		
		  		if(!exists){
			  		topPoints = topPoints.concat(topPoint);
			  		var lat = topPoint.x;
			  		var lng = topPoint.y;
			  		var elv = topPoint.z;
			  		var profilePoint = new ProfilePoint(lat, lng, elv);
			  		profilePoints.push(profilePoint);
		  		}
		  	});
			*/
		  	this.profilePoints = profilePoints;
		  },

		  /**
		  * Get minimum longitude
		  * @return {Number} minimum value of all longitudes
		  */
		  getMinLng: function(){
		  	return _.min(_.pluck(this.profilePoints, 'lng'));
		  },
		  /**
		  * Get maximum longitude
		  * @return {Number} maximum value of all longitudes
		  */
		  getMaxLng: function(){
		  	return _.max(_.pluck(this.profilePoints, 'lng'));
		  },
		  /**
		  * Get minimum latitude
		  * @return {Number} minimum value of all latitudes
		  */
		  getMinLat: function(){
			return _.min(_.pluck(this.profilePoints, 'lat'))
		  },
		  /**
		  * Get maximum latitude
		  * @return {Number} maximum value of all latitudes
		  */
		  getMaxLat: function(){
		  	return _.max(_.pluck(this.profilePoints, 'lat'))
		  },
		  /*
		  * Get minimum elevation
		  * @return {Number} maximum value of all elevations
		  */
		  getMinElv: function(){
			return _.min(_.pluck(this.profilePoints, 'elv'))
		  },
		  /**
		  * Get maximum elevation
		  * @return {Number} maximum value of all elevations
		  */
		  getMaxElv: function(){
		  	return _.max(_.pluck(this.profilePoints, 'elv'))
		  },
		  /**
		  * Get the model width as the distance between the easternmost and the westermost point
		  * @return {Number} the distance between the easternmost and the westermost point in meters
		  */
		  getDimensionX: function(){
		  	var nw = {'lat': this.getMaxLat(), 'lng': this.getMinLng()};
		  	var ne = {'lat': this.getMaxLat(), 'lng': this.getMaxLng()};
		  	return Math.floor(gmUtil.degreeToMeter(nw, ne));
		  },
		  /**
		  * Get the model depth (length) as the distance between te southernmost and the northernmost point
		  * @return {Number} the distance between the southernmost and the northernmost point in meters
		  */
		  getDimensionZ: function(){
		  	var sw = {'lat': this.getMinLat(), 'lng': this.getMinLng()};	
		  	var nw = {'lat': this.getMaxLat(), 'lng': this.getMinLng()};
		  	return Math.floor(gmUtil.degreeToMeter(sw, nw));
		  },

		  /**
		  * Get the model height as the distance between the lowest and the highest point
		  * @return {Number} the distance between the lowest and the highest point in meters
		  */
		  getDimensionY: function(){
		  	return this.getMaxElv() - this.getMinElv();
		  },

		  rotate: function(angle, damping){
		  	var rotation = (angle - this.mesh.rotation.y) * damping;
          	this.mesh.rotation.y += rotation;
          	if (this.mold)
          		this.mold.rotation.y += rotation;
		  },

		  /**
		  * 
		  */
		  getBottomIndex: function(i){
		  	var side = Math.sqrt(this.profilePoints.length);
		  	return this.profilePoints.length + i + side - 2*(i%side) - 1
		  }
	};

	return Profile;
});