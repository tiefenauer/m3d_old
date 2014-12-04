/* jslint unused: false */
'use strict';
define([
  'jquery'
  ],
  function ($) {

    var SliderDirective = function() {
      return {
        restrict: 'A',
        scope: {
          config: '=config',
          model: '=model'
        },
        link: function(scope, elem, attrs) {
          var setModel = function(value) {
              scope.model = value;   
          };
              
          $(elem).slider({
            range: false,
            min: scope.config.min,
            max: scope.config.max,
            step: scope.config.step,
            value: scope.model,
            slide: function(event, ui) { 
                scope.$apply(function() {
                    scope.model = ui.value;
                });
            }
          });
        }
      };
    };

    return SliderDirective;
});
