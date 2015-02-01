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
			this.profilePoints = profilePoints;
			this.thickness = thickness;
			this.segmentsX =  Math.sqrt(profilePoints.length) - 1;
			this.segmentsY =  Math.sqrt(profilePoints.length) - 1;
			this.updateMesh();
		};

		Profile.prototype = /** @lends m3d.model.Profile.prototype */{
		  name: '',
		  profilePoints: [],
		  thickness: 0,
		  segmentsX: 0,
		  segmentsY: 0,
		  mesh: null,

		  updateMesh: function(){
		  	var geometry = new THREE.BoxGeometry(this.thickness, this.getHeight(), this.getWidth(), 1, this.segmentsX, this.segmentsY);
		  	var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true });
		  	var mesh = new THREE.Mesh(geometry, material);

	  	    var rotationZ = new THREE.Matrix4().makeRotationZ( - Math.PI/2 );
		    var rotationX = new THREE.Matrix4().makeRotationX( Math.PI );
			mesh.updateMatrix();
		    mesh.geometry.applyMatrix(mesh.matrix);
		    mesh.geometry.applyMatrix(rotationZ);
		    mesh.geometry.applyMatrix(rotationX);
		    mesh.matrix.identity();

			var diff = 0;
			var side = Math.sqrt(this.profilePoints.length);

			//model.geometry.vertices.length
			for(var i=0; i < this.profilePoints.length; i++){
				diff = this.profilePoints[i].elv - this.getMinElv();         
				var bottomIndex = this.profilePoints.length + i + side - 2*(i%side) - 1;
				mesh.geometry.vertices[i].y += diff / 10; 
				mesh.geometry.vertices[bottomIndex].y += diff / 10;
			}

			mesh.geometry.computeFaceNormals();
			mesh.geometry.computeVertexNormals();
			this.mesh = mesh;
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
		  * Get the distance between the easternmost and the westermost point
		  * @return {Number} the distance between the easternmost and the westermost point in meters
		  */
		  getWidth: function(){
		  	var nw = {'lat': this.getMaxLat(), 'lng': this.getMinLng()};
		  	var ne = {'lat': this.getMaxLat(), 'lng': this.getMaxLng()};
		  	return Math.floor(gmUtil.degreeToMeter(nw, ne) / 100) * 10;
		  },
		  /**
		  * Get the distance between te southernmost and the northernmost point
		  * @return {Number} the distance between te southernmost and the northernmost point in meters
		  */
		  getHeight: function(){
		  	var sw = {'lat': this.getMinLat(), 'lng': this.getMinLng()};	
		  	var nw = {'lat': this.getMaxLat(), 'lng': this.getMinLng()};
		  	return Math.floor(gmUtil.degreeToMeter(sw, nw) / 100) * 10;
		  }
	};
	
	return Profile;
});