define([
  'angular'
  ,'lodash'
  ,'models/footprint'
  ,'models/m3dProfilePoint'
  ], 
  function(angular, _, Footprint, ProfilePoint){

    var GemeindeFootprint = function(map){
      Footprint.call(this, map);
    };

    GemeindeFootprint.prototype = Object.create(Footprint.prototype);

    GemeindeFootprint.prototype.setShape = function(doc){
      var polygon = doc.placemarks[0].Polygon[0];
      Footprint.prototype.setShape.call(this, polygon);
      // dummy function
      this.shape.setMap = function(){};
    };

    GemeindeFootprint.prototype.rasterize = function(){
      var coordinates = this.shape.outerBoundaryIs[0].coordinates;
      var profilePoints = [];
      _.forEach(coordinates, function(coordinate, i){
        profilePoints.push(new ProfilePoint({lat: coordinate.lat, lng: coordinate.lng, elv: coordinate.alt}));
      });
      return profilePoints;
    };

    return GemeindeFootprint;
});