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
		  segmentsY: 1,
		  segmentsZ: 0,
		  mesh: null,
		  mold: null,

		  /**
		  * Get mold for profile (if not existent, it will be created)
		  */
		  getMold: function(){
  		  	if (!this.mold)
				this.mold = invert(this);
			return this.mold;
		  },

		  /**
		  * initialize the object
		  * @param {Object} options configuration options
		  */ 
		  init: function(options){		  	
		  	this.thickness = options.thickness;		  	
			if (options.profilePoints.length > 0){				
				this.profilePoints = _.sortByAll(options.profilePoints, ['lat', 'lng']);
				this.segmentsX =  Math.sqrt(this.profilePoints.length) - 1;
				this.segmentsY =  Math.sqrt(this.profilePoints.length) - 1;
				this.updateMesh(this.profilePoints);
			}
			else if (options.mesh){
				this.mesh = options.mesh;
				//this.updateProfilePoints(this.mesh);
				//this.updateMesh(this.profilePoints);
			}
			this.name = this.mesh.name = this.mesh.id;	
		  },

		  /**
		  * update mesh according to given ProfilePoints
		  * @param {m3d.model.ProfilePoint[]} profilePoints array of ProfilePoints to create the mesh
		  */
		  updateMesh: function(profilePoints){
		  	var geometry = new THREE.BoxGeometry(this.thickness, this.getDistanceZ(), this.getDistanceX(), 1, this.segmentsX, this.segmentsY);
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

		  getDimensionX: function(){
		  	var xs = _.pluck(this.mesh.geometry.vertices, 'x');
		  	var maxX = _.max(xs);
		  	var minX = _.min(xs);
		  	return Math.floor(Math.abs(maxX - minX));
		  },

		  getDimensionY: function(){
			var ys = _.pluck(this.mesh.geometry.vertices, 'y');
		  	var maxY = _.max(ys);
		  	var minY = _.min(ys);
		  	return Math.floor(Math.abs(maxY - minY));
		  },

		  getDimensionZ: function(){
			var zs = _.pluck(this.mesh.geometry.vertices, 'z');
		  	var maxZ = _.max(zs);
		  	var minZ = _.min(zs);
		  	return Math.floor(Math.abs(maxZ - minZ));
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
		  	/*
		  	var topPoints = this.mesh.geometry.vertices.splice(0, Math.ceil(this.mesh.geometry.vertices.length / 2));
		  	var side = Math.sqrt(topPoints.length);
		  	return topPoints.length + i + side - 2*(i%side) - 1;
		  	*/		  	
		  	var side = Math.sqrt(this.profilePoints.length);		  	
		  	return this.profilePoints.length + i + side - 2*(i%side) - 1;
		  }
	};

	/**
  	* create a mold by inverting the objects
  	* @param {m3d.models.Profile[]} profiles the profiles to be inverted
  	*/
  	var invert = function(profile){
  	  profile.mesh.geometry.computeVertexNormals();
	  // Quader für Gussform vorbereiten
	  var boxBorderThickness = profile.getDimensionY() * 1.1 - profile.getDimensionY();
	  var boxWidth = profile.getDimensionZ() + boxBorderThickness;
	  var boxHeight = profile.getDimensionY() * 2 + boxBorderThickness;
	  var boxDepth =  profile.getDimensionX() + boxBorderThickness;
	  var boxGeometry = new THREE.BoxGeometry(boxDepth, boxHeight, boxWidth);
	  boxGeometry.dynamic = true;
	  // y-Position der unteren Vertices anpassen
	  boxGeometry.vertices.forEach(function(vertex){
	    if (vertex.y < 0)
	      vertex.y = -1 * boxBorderThickness;
	  });
	  boxGeometry.verticesNeedUpdate = true;

	  // Modell kopieren und Sockel erstellen
	  profile.mesh.geometry.computeVertexNormals();
	  var profileCopy = new Profile({
	    profilePoints: profile.profilePoints,
	    mesh: profile.mesh
	  });	  
	  profile.mesh.geometry.computeVertexNormals();
	  profileCopy.mesh.geometry.computeVertexNormals();

	  profileCopy.mesh.dynamic = true;

	  profile.mesh.geometry.computeVertexNormals();
	  profileCopy.mesh.geometry.computeVertexNormals();

	  // Sockel erstellen
	  if (profileCopy.profilePoints.length > 0){
		_.forEach(profileCopy.profilePoints, function(point, i){
	  	  	var bottomIndex = profileCopy.getBottomIndex(i);                        
		    profileCopy.mesh.geometry.vertices[bottomIndex].y = -1 * boxHeight;
  	  	});		
	  } 
	  else{
	  	var half = Math.ceil(profileCopy.mesh.geometry.vertices.length / 2);
	  	var getBoti = function(n){	  		
	  		var side = Math.sqrt(half);		  	
		  	return half + n + side - 2*(n%side) - 1;
	  	}
	  	for(var i=0; i<half; i++){
	    //_.forEach(profileCopy.mesh.geometry.vertices, function(vertex, i){
	    	var boti = getBoti(i);
	    	profileCopy.mesh.geometry.vertices[boti].y = -1 * boxHeight;
		//});
		}
	  };	  
	  //profileCopy.mesh = profile.mesh;
	  profileCopy.mesh.geometry.verticesNeedUpdate = true;
	  profileCopy.mesh.geometry.mergeVertices();
	  profileCopy.mesh.geometry.computeVertexNormals();

	  // Gussform aus Quader konstruieren          
	  var csgBox = new THREE.ThreeBSP(boxGeometry);
	  var csgProfile = new THREE.ThreeBSP(profileCopy.mesh);
	  var csgMold = csgBox.subtract(csgProfile);
	  var geometry = csgMold.toGeometry();

	  var material = new THREE.MeshPhongMaterial({color: 0x00ff00, dynamic: true });
	  var mold = new THREE.Mesh(geometry, material);

	  // Gussform um 180° drehen
	  var moldRotation = new THREE.Matrix4().makeRotationX( Math.PI );
	  mold.updateMatrix();
	  mold.geometry.applyMatrix(mold.matrix);
	  mold.geometry.applyMatrix(moldRotation);
	  mold.matrix.identity();
	  mold.name = profile.mesh.name + 'mold';
	  return mold;
  	};	

	return Profile;
});