define([
	 'angular'
	,'lodash'
	,'models/m3dProfilePoint'
	,'util/GoogleMapsUtil'
	],
	function(angular, _, ProfilePoint, gmUtil){

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
		  segmentsX: 0,
		  segmentsY: 1,
		  segmentsZ: 0,
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
				if (this.profilePoints.length > 0){
					this.segmentsX =  Math.sqrt(this.profilePoints.length) - 1;
					this.segmentsY =  Math.sqrt(this.profilePoints.length) - 1;
					if (!this.mesh)
						this.updateMesh(this.profilePoints);
				}
				if(this.mesh)
					this.mesh.name = this.name;
		  },

		  /**
		  * update mesh according to given ProfilePoints
		  * @param {m3d.model.ProfilePoint[]} profilePoints array of ProfilePoints to create the mesh
		  */
		  updateMesh: function(profilePoints){
		  	var geometry = new THREE.BoxGeometry(this.thickness, this.getDistanceZ(), this.getDistanceX(), 1, this.segmentsX, this.segmentsY);
		  	var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true });
		  	var mesh = new THREE.Mesh(geometry, material);
		  	this.mesh = mesh;
		  	mesh.name = this.name;
		  	mesh.geometry.dynamic = true;

	  	  var rotationZ = new THREE.Matrix4().makeRotationZ( - Math.PI/2 );
		    var rotationX = new THREE.Matrix4().makeRotationX( Math.PI );
				mesh.updateMatrix();
		    mesh.geometry.applyMatrix(mesh.matrix);
		    mesh.geometry.applyMatrix(rotationZ);
		    mesh.geometry.applyMatrix(rotationX);
		    mesh.matrix.identity();

				var diff = 0;

				// Profilpunkte verschieben
				_.forEach(this.profilePoints, function(point, i){
					diff = point.elv - this.getMinElv();         
					var bottomIndex = this.getBottomIndex(i);
					mesh.geometry.vertices[i].y += diff; 
					mesh.geometry.vertices[bottomIndex].y += diff;				
				}, this);

				mesh.geometry.computeFaceNormals();
				mesh.geometry.computeVertexNormals();
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
		  		var profilePoint = new ProfilePoint({lat: lat, lng: lng, elv: elv});
		  		profilePoints.push(profilePoint);
		  	});
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

		  /**
		  * Get the index on the bottom for a vertex on top
		  * @return {Number} the index of the vertex on the bottom
		  */
		  getBottomIndex: function(i){
		  	if (!this.mesh)
		  		return -1;
		  	if (i<0)
		  		return -1;
		  	if (i > this.mesh.geometry.vertices.length)
		  		return -1;

		  	var half = Math.ceil(this.mesh.geometry.vertices.length / 2);
		  	if (i > half)
		  		return -1;
		  	var side = Math.sqrt(half);		  	
		  	return half + i + side - 2*(i%side) - 1;
		  },

		  /**
		  * Get the vertex on the bottom for a vertex on top
		  * @returns {THREE.Vector3} the vertex on the bottom or null if 
		  * - the index is not on top or 
		  * - the vertex is not in the mesh
		  * - there is no mesh for the profile
		  */
		  getBottomVertex: function(vertex){
		  	if (!this.mesh || !vertex)
		  		return null;
		  	var index = _.indexOf(this.mesh.geometry.vertices, vertex);
		  	// not found
		  	if (index < 0)
		  		return null;

		  	var bottomIndex = this.getBottomIndex(index);
		  	var bottomVertex = this.mesh.geometry.vertices[bottomIndex];
		  	if (typeof bottomVertex == 'undefined')
		  		return null;
		  	return bottomVertex;
		  }
	};

	return Profile;
});