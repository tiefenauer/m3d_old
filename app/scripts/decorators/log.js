'use strict';
define([
  'util/DateTime'
  ,'util/supplant'    
  ,'angular'
  ], 
  function (DateTime, supplant) {
    
    var Logger = function( $delegate ){
      // Save the original $log.debug()
      var debugFn = $delegate.debug;

      $delegate.debug = function(){
        var args    = [].slice.call(arguments),
            now     = DateTime.formattedNow();   
        // Prepend timestamp
        args[0] = supplant('{0} - {1}', [ now, args[0] ]);
        // Call the original with the output prepended with formatted timestamp
        debugFn.apply(null, args);
      };

      return $delegate;
    };

    return Logger;

});