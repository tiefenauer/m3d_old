define(
	['jquery'
	,'threejs']
	,function($){

		'use strict';

		var canvas, camera, renderer;
		var $canvas;
		var targetRotation = 0;
		var targetRotationOnMouseDown = 0;

		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;

		var mouseX = 0;
		var mouseXOnMouseDown = 0;

		var RotationHelper = function(canvasElement, threeCamera, threeRenderer){
			camera = threeCamera;
			canvas = canvasElement;
			renderer = threeRenderer;
			$canvas = $(canvas);
		};

		RotationHelper.prototype = {
			active: false,
			get targetRotation(){
					return targetRotation;
			},

			start: function(){
				this.active = true;
				addEventListeners();
			},

			stop: function(rotation){				
				this.active = false;
				targetRotation = rotation;
				removeEventListeners();
				//targetRotation = 0;
			}

		};

		var addEventListeners = function(){
			canvas.addEventListener( 'mousedown', onDocumentMouseDown, false );
			//canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
			canvas.addEventListener( 'mouseup', onDocumentMouseUp, false );
			canvas.addEventListener( 'mouseout', onDocumentMouseOut, false );			
			canvas.addEventListener( 'touchstart', onDocumentTouchStart, false );
			//canvas.addEventListener( 'touchmove', onDocumentTouchMove, false );			
			window.addEventListener( 'resize', onWindowResize, false );			
		};

		var removeEventListeners = function( ) {
			canvas.removeEventListener( 'mousedown', onDocumentMouseDown, false );
			//canvas.removeEventListener( 'mousemove', onDocumentMouseMove, false );
			canvas.removeEventListener( 'mouseup', onDocumentMouseUp, false );
			canvas.removeEventListener( 'mouseout', onDocumentMouseOut, false );
			canvas.removeEventListener( 'touchstart', onDocumentTouchStart, false );
			//canvas.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		};		

		var onWindowResize = function() {
			windowHalfX = $canvas.width() / 2;
			windowHalfY = $canvas.height() / 2;

			camera.aspect = windowHalfX / windowHalfY;
			camera.updateProjectionMatrix();

			renderer.setSize( $canvas.width(), $canvas.height() );
		};

		var onDocumentMouseDown = function( event ) {
			event.preventDefault();

			canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
			canvas.addEventListener( 'mouseup', onDocumentMouseUp.bind(this), false );
			canvas.addEventListener( 'mouseout', onDocumentMouseOut.bind(this), false );

			mouseXOnMouseDown = event.clientX - windowHalfX;
			targetRotationOnMouseDown = targetRotation;
		};

		var onDocumentMouseMove = function( event ) {
			mouseX = event.clientX - windowHalfX;
			targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;			
		};

		var onDocumentMouseUp = function( ) {
			canvas.removeEventListener( 'mousemove', onDocumentMouseMove, false );
			canvas.removeEventListener( 'mouseup', onDocumentMouseUp, false );
			canvas.removeEventListener( 'mouseout', onDocumentMouseOut, false );
		};

		var onDocumentMouseOut = function( ) {
			canvas.removeEventListener( 'mousemove', onDocumentMouseMove.bind(this), false );
			canvas.removeEventListener( 'mouseup', onDocumentMouseUp.bind(this), false );
			canvas.removeEventListener( 'mouseout', onDocumentMouseOut.bind(this), false );

		};

		var onDocumentTouchStart = function( event ) {
			if ( event.touches.length === 1 ) {
				event.preventDefault();
				mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
				targetRotationOnMouseDown = targetRotation;
			}

		};

		var onDocumentTouchMove = function( event ) {
			if ( event.touches.length === 1 ) {
				event.preventDefault();
				mouseX = event.touches[ 0 ].pageX - windowHalfX;
				targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
			}
		};

		return RotationHelper;
	}
	);