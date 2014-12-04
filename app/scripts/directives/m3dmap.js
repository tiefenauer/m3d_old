'use strict'
define(function () {

    var MapDirective = function(){
        return {
          templateUrl: 'views/templates/map.html',
          restrict: 'E',
          controller: 'MapCtrl'
        };      
    };

    return MapDirective;

});
