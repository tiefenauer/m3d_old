define([
   'angular'
  ,'lodash'
  ,'util/GoogleMapsUtil'
  ], 
  function(angular, _, gmUtil){

    var ProfileUtil = {};

    /**
    * Get minimum longitude
    * @return {Number} minimum value of all longitudes
    */
    ProfileUtil.getMinLng = function(profilePoints){
      return _.min(_.pluck(profilePoints, 'lng'));
    };
    /**
    * Get maximum longitude
    * @return {Number} maximum value of all longitudes
    */
    ProfileUtil.getMaxLng = function(profilePoints){
      return _.max(_.pluck(profilePoints, 'lng'));
    };
    /**
    * Get minimum latitude
    * @return {Number} minimum value of all latitudes
    */
    ProfileUtil.getMinLat = function(profilePoints){
      return _.min(_.pluck(profilePoints, 'lat'))
    };
    /**
    * Get maximum latitude
    * @return {Number} maximum value of all latitudes
    */
    ProfileUtil.getMaxLat = function(profilePoints){
      return _.max(_.pluck(profilePoints, 'lat'))
    };
    /*
    * Get minimum elevation
    * @return {Number} maximum value of all elevations
    */
    ProfileUtil.getMinElv = function(profilePoints){
      return _.min(_.pluck(profilePoints, 'elv'))
    };
    /**
    * Get maximum elevation
    * @return {Number} maximum value of all elevations
    */
    ProfileUtil.getMaxElv = function(profilePoints){
      return _.max(_.pluck(profilePoints, 'elv'))
    };

    /**
    * Get the model width as the distance between the easternmost and the westermost point
    * @return {Number} the distance between the easternmost and the westermost point in meters
    */
    ProfileUtil.getDistanceX = function(coordinates){
      var nw = {'lat': this.getMaxLat(coordinates), 'lng': this.getMinLng(coordinates)};
      var ne = {'lat': this.getMaxLat(coordinates), 'lng': this.getMaxLng(coordinates)};
      return Math.floor(gmUtil.degreeToMeter(nw, ne));
    };

    /**
    * Get the model depth (length) as the distance between te southernmost and the northernmost point
    * @return {Number} the distance between the southernmost and the northernmost point in meters
    */
    ProfileUtil.getDistanceZ = function(coordinates){
      var sw = {'lat': this.getMinLat(coordinates), 'lng': this.getMinLng(coordinates)};  
      var nw = {'lat': this.getMaxLat(coordinates), 'lng': this.getMinLng(coordinates)};
      return Math.floor(gmUtil.degreeToMeter(sw, nw));
    };

    /**
    * Get the model height as the distance between the lowest and the highest point
    * @return {Number} the distance between the lowest and the highest point in meters
    */
    ProfileUtil.getDistanceY = function(coordinates){
      return this.getMaxElv() - this.getMinElv();
    };

    /**
    * Get the index on the bottom for a vertex on top
    * @return {Number} the index of the vertex on the bottom
    */
    ProfileUtil.getBottomIndex = function(i, vertices){
      if (!vertices)
        return -1;
      if (vertices.length == 0)
        return -1;
      if (i<0)
        return -1;
      if (i > vertices.length)
        return -1;

      var half = Math.ceil(vertices.length / 2);
      if (i > half)
        return -1;
      var side = Math.sqrt(half);       
      return half + i + side - 2*(i%side) - 1;
    };

    /**
    * Get the vertex on the bottom for a vertex on top
    * @returns {THREE.Vector3} the vertex on the bottom or null if 
    * - the index is not on top or 
    * - the vertex is not in the mesh
    * - there is no mesh for the profile
    */
    ProfileUtil.getBottomVertex = function(vertex, vertices){
      if (!vertices || vertices.length == 0 || !vertex)
        return null;
      var index = _.indexOf(vertices, vertex);
      // not found
      if (index < 0)
        return null;

      var bottomIndex = this.getBottomIndex(index);
      var bottomVertex = vertices[bottomIndex];
      if (typeof bottomVertex == 'undefined')
        return null;
      return bottomVertex;
    };

    return ProfileUtil;
});