/* jshint ignore:start */

'use strict';
define([
	'threejs'
	],
	function(THREE){
		THREE.STLLoader = function () {};

		THREE.STLLoader.prototype = {

			constructor: THREE.STLLoader

		};

		THREE.STLLoader.prototype.load = function ( url, callback ) {

			var scope = this;

			var xhr = new XMLHttpRequest();

			function onloaded( event ) {

				if ( event.target.status === 200 || event.target.status === 0 ) {

					var geometry = scope.parse( event.target.response || event.target.responseText );

					scope.dispatchEvent( { type: 'load', content: geometry } );

					if ( callback ) callback( geometry );

				} else {

					scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']', response: event.target.statusText } );

				}

			}

			xhr.addEventListener( 'load', onloaded, false );

			xhr.addEventListener( 'progress', function ( event ) {

				scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

			}, false );

			xhr.addEventListener( 'error', function () {

				scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

			}, false );

			if ( xhr.overrideMimeType ) xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
			xhr.open( 'GET', url, true );
			xhr.responseType = 'arraybuffer';
			xhr.send( null );

		};

		THREE.STLLoader.prototype.loadLocal = function(file, callback){
			var scope = this;
			var r = new FileReader();
			r.onload = function(e){
				var contents = e.target.result;
				console.log(file.name);
				console.log(file.type);
				console.log(file.size);
				console.log(contents.substr(0,100));
				var geometry =scope.parse(contents);
				scope.dispatchEvent( { type: 'load', content: geometry, file: file } );
				if (callback) callback(geometry, file);
			};
			r.readAsBinaryString(file);
		};

		THREE.STLLoader.prototype.parse = function ( data ) {


			var isBinary = function () {

				var expect, faceSize, nFaces, reader;
				reader = new DataView( binData );
				faceSize = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
				nFaces = reader.getUint32(80,true);
				expect = 80 + (32 / 8) + (nFaces * faceSize);
				return expect === reader.byteLength;

			};

			var binData = this.ensureBinary( data );

			return isBinary()
				? this.parseBinary( binData )
				: this.parseASCII( this.ensureString( data ) );

		};

		THREE.STLLoader.prototype.parseBinary = function ( data ) {

			var reader = new DataView( data );
			var faces = reader.getUint32( 80, true );
			var dataOffset = 84;
			var faceLength = 12 * 4 + 2;

			var offset = 0;

			var geometry = new THREE.BufferGeometry();

			var vertices = new Float32Array( faces * 3 * 3 );
			var normals = new Float32Array( faces * 3 * 3 );

			for ( var face = 0; face < faces; face ++ ) {

				var start = dataOffset + face * faceLength;

				for ( var i = 1; i <= 3; i ++ ) {

					var vertexstart = start + i * 12;

					vertices[ offset     ] = reader.getFloat32( vertexstart, true );
					vertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true );
					vertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true );

					normals[ offset     ] = reader.getFloat32( start    , true );
					normals[ offset + 1 ] = reader.getFloat32( start + 4, true );
					normals[ offset + 2 ] = reader.getFloat32( start + 8, true );

					offset += 3;

				}

			}

			geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
			geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

			return geometry;

		};

		THREE.STLLoader.prototype.parseASCII = function (data) {

			var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
			geometry = new THREE.Geometry();
			patternFace = /facet([\s\S]*?)endfacet/g;

			while ( ( result = patternFace.exec( data ) ) !== null ) {

				text = result[0];
				patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

				while ( ( result = patternNormal.exec( text ) ) !== null ) {

					normal = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );

				}

				patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

				while ( ( result = patternVertex.exec( text ) ) !== null ) {

					geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );

				}

				length = geometry.vertices.length;

				geometry.faces.push( new THREE.Face3( length - 3, length - 2, length - 1, normal ) );

			}

			geometry.computeBoundingBox();
			geometry.computeBoundingSphere();

			return geometry;

		};

		THREE.STLLoader.prototype.ensureString = function (buf) {

			if (typeof buf !== 'string'){
				var arrayBuffer = new Uint8Array(buf);
				var str = '';
				for(var i = 0; i < buf.byteLength; i++) {
					str += String.fromCharCode(arrayBuffer[i]); // implicitly assumes little-endian
				}
				return str;
			} else {
				return buf;
			}

		};

		THREE.STLLoader.prototype.ensureBinary = function (buf) {

			if (typeof buf === 'string'){
				var arrayBuffer = new Uint8Array(buf.length);
				for(var i = 0; i < buf.length; i++) {
					arrayBuffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
				}
				return arrayBuffer.buffer || arrayBuffer;
			} else {
				return buf;
			}

		};

		THREE.EventDispatcher.prototype.apply( THREE.STLLoader.prototype );

		if ( typeof DataView === 'undefined'){

			DataView = function(buffer, byteOffset, byteLength){

				this.buffer = buffer;
				this.byteOffset = byteOffset || 0;
				this.byteLength = byteLength || buffer.byteLength || buffer.length;
				this._isString = typeof buffer === 'string';

			}

			DataView.prototype = {

				_getCharCodes:function(buffer,start,length){
					start = start || 0;
					length = length || buffer.length;
					var end = start + length;
					var codes = [];
					for (var i = start; i < end; i++) {
						codes.push(buffer.charCodeAt(i) & 0xff);
					}
					return codes;
				},

				_getBytes: function (length, byteOffset, littleEndian) {

					var result;

					// Handle the lack of endianness
					if (littleEndian === undefined) {

						littleEndian = this._littleEndian;

					}

					// Handle the lack of byteOffset
					if (byteOffset === undefined) {

						byteOffset = this.byteOffset;

					} else {

						byteOffset = this.byteOffset + byteOffset;

					}

					if (length === undefined) {

						length = this.byteLength - byteOffset;

					}

					// Error Checking
					if (typeof byteOffset !== 'number') {

						throw new TypeError('DataView byteOffset is not a number');

					}

					if (length < 0 || byteOffset + length > this.byteLength) {

						throw new Error('DataView length or (byteOffset+length) value is out of bounds');

					}

					if (this.isString){

						result = this._getCharCodes(this.buffer, byteOffset, byteOffset + length);

					} else {

						result = this.buffer.slice(byteOffset, byteOffset + length);

					}

					if (!littleEndian && length > 1) {

						if (!(result instanceof Array)) {

							result = Array.prototype.slice.call(result);

						}

						result.reverse();
					}

					return result;

				},

				// Compatibility functions on a String Buffer

				getFloat64: function (byteOffset, littleEndian) {

					var b = this._getBytes(8, byteOffset, littleEndian),

						sign = 1 - (2 * (b[7] >> 7)),
						exponent = ((((b[7] << 1) & 0xff) << 3) | (b[6] >> 4)) - ((1 << 10) - 1),

					// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
						mantissa = ((b[6] & 0x0f) * Math.pow(2, 48)) + (b[5] * Math.pow(2, 40)) + (b[4] * Math.pow(2, 32)) +
									(b[3] * Math.pow(2, 24)) + (b[2] * Math.pow(2, 16)) + (b[1] * Math.pow(2, 8)) + b[0];

					if (exponent === 1024) {
						if (mantissa !== 0) {
							return NaN;
						} else {
							return sign * Infinity;
						}
					}

					if (exponent === -1023) { // Denormalized
						return sign * mantissa * Math.pow(2, -1022 - 52);
					}

					return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);

				},

				getFloat32: function (byteOffset, littleEndian) {

					var b = this._getBytes(4, byteOffset, littleEndian),

						sign = 1 - (2 * (b[3] >> 7)),
						exponent = (((b[3] << 1) & 0xff) | (b[2] >> 7)) - 127,
						mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];

					if (exponent === 128) {
						if (mantissa !== 0) {
							return NaN;
						} else {
							return sign * Infinity;
						}
					}

					if (exponent === -127) { // Denormalized
						return sign * mantissa * Math.pow(2, -126 - 23);
					}

					return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
				},

				getInt32: function (byteOffset, littleEndian) {
					var b = this._getBytes(4, byteOffset, littleEndian);
					return (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0];
				},

				getUint32: function (byteOffset, littleEndian) {
					return this.getInt32(byteOffset, littleEndian) >>> 0;
				},

				getInt16: function (byteOffset, littleEndian) {
					return (this.getUint16(byteOffset, littleEndian) << 16) >> 16;
				},

				getUint16: function (byteOffset, littleEndian) {
					var b = this._getBytes(2, byteOffset, littleEndian);
					return (b[1] << 8) | b[0];
				},

				getInt8: function (byteOffset) {
					return (this.getUint8(byteOffset) << 24) >> 24;
				},

				getUint8: function (byteOffset) {
					return this._getBytes(1, byteOffset)[0];
				}

			 };

		}

	}
);

/* jshint ignore:end */