const THREE = require('THREE');
const ImprovedNoise = require('improved-noise');

class Terrain {

	constructor( width = 6000, length = 6000, xVerts = 256, yVerts = 256 ){
		this.width = width;
		this.length = length;
		this.xVerts = xVerts;
		this.yVerts = yVerts;
	}

	returnTerrainObj(){
		const terrainGeom = new THREE.PlaneBufferGeometry( this.width, this.length, this.xVerts, this.yVerts ),
			  terrainMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
			  terrain = new THREE.Mesh( terrainGeom, terrainMat );
		
		terrain.position.set( 0, 0, 0 );
		terrain.name = "terrain";

		return terrain;
	}

}

class ProceduralTerrain extends Terrain {

	constructor( worldWidth = 256, worldDepth = 256 ){
		super();
		this.worldWidth = worldWidth;
		this.worldDepth = worldDepth;
		this.worldHalfWidth = worldWidth/2;
		this.worldHalfDepth = worldDepth/2;
		this.data = this.generateHeight( worldWidth, worldDepth );
	}

	vertexShader(){
		return `
		    varying vec3 vUv; 

		    void main() {
		      vUv = position; 

		      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
		      gl_Position = projectionMatrix * viewMatrix * modelPosition; 
		    }
		`
	}

	fragmentShader(){
		return `
			precision mediump float;
			varying vec3 vUv;

			vec3 color_from_height( const float height ) {
			    vec3 terrain_colours[4];
			    terrain_colours[0] = vec3(0.0,0.0,0.6); 
			    terrain_colours[1] = vec3(0.1, 0.3, 0.1);
			    terrain_colours[2] = vec3(0.4, 0.8, 0.4);
			    terrain_colours[3] = vec3(1.0,1.0,1.0);

			    if (height < 0.0){
			        return terrain_colours[0];
			    } else {
			        float hscaled = height*2.0 - 1e-05; // hscaled should range in [0,2]
			        int hi = int(hscaled); // hi should range in [0,1]
			        float hfrac = hscaled-float(hi); // hfrac should range in [0,1]
			        if (hi == 0)
			            return mix( terrain_colours[1],terrain_colours[2],hfrac); // blends between the two colours    
			        else
			            return mix( terrain_colours[2],terrain_colours[3],hfrac); // blends between the two colours
			    }

			    return vec3(0.0,0.0,0.0);
			}

			void main() {
				vec2 uv = gl_FragCoord.xy / iResolution.xy;
				vec3 col = color_from_height(uv.y*2.0-1.0);
				gl_FragColor = vec4(col, 1.0);
			}
		`
	}

	returnCameraStartPosY(){
		return this.data[ this.worldHalfWidth + this.worldHalfDepth * this.worldWidth ] * 10 + 500;
	}

	returnTerrainObj(){
		const terrainGeom =  new THREE.PlaneBufferGeometry( 7500, 7500, this.worldWidth - 1, this.worldDepth - 1 ),
			  texture = new THREE.CanvasTexture( this.generateTexture( this.data, this.worldWidth, this.worldDepth ) ),
			  // texture = new THREE.ShaderMaterial({
			  // 	fragmentShader: this.fragmentShader(),
			  // 	vertexShader: this.vertexShader()
			  // }),
			  terrain = new THREE.Mesh( terrainGeom, new THREE.MeshBasicMaterial({ map: texture }) );
		let   vertices = terrainGeom.attributes.position.array;
		
		terrainGeom.rotateX( - Math.PI / 2 );

		for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
			vertices[ j + 1 ] = this.data[ i ] * 10;
		}

		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;

		return terrain;
	}

	generateHeight( width, height ){
		const size = width * height, data = new Uint8Array( size ),
			  perlin = new ImprovedNoise(), 
			  z = Math.random() * 100;
		let   quality = 1;

		for ( var j = 0; j < 4; j ++ ) {

			for ( var i = 0; i < size; i ++ ) {
				var x = i % width, y = ~ ~ ( i / width );
				data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
			}

			quality *= 5;

		}

		return data;
	}

	generateTexture( data, width, height ){
		var canvas, canvasScaled, context, image, imageData, vector3, sun, shade,
			vector3 = new THREE.Vector3( 0, 0, 0 ),
			sun = new THREE.Vector3( 1, 1, 1 ),
			canvas = document.createElement( 'canvas' ),
			context = canvas.getContext( '2d' ),
			image = context.getImageData( 0, 0, canvas.width, canvas.height ),
			imageData = image.data;

		sun.normalize();
		canvas.width = width;
		canvas.height = height;
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );

		for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
			vector3.x = this.data[ j - 2 ] - this.data[ j + 2 ];
			vector3.y = 2;
			vector3.z = this.data[ j - width * 2 ] - this.data[ j + width * 2 ];
			vector3.normalize();

			shade = vector3.dot( sun );

			imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		}

		console.log("first imageData");
		console.log(imageData);

		context.putImageData( image, 0, 0 );
		// Scaled 4x
		canvasScaled = document.createElement( 'canvas' );
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;

		context = canvasScaled.getContext( '2d' );
		context.scale( 4, 4 );
		context.drawImage( canvas, 0, 0 );

		image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
		imageData = image.data;

		for ( let i = 0, l = imageData.length; i < l; i += 4 ) {
			let v = ~ ~ ( Math.random() * 5 );
			imageData[ i ] += v;
			imageData[ i + 1 ] += v;
			imageData[ i + 2 ] += v;
		}

		context.putImageData( image, 0, 0 );

		console.log("imageData");
		console.log(imageData);

		console.log("canvasScaled");
		console.log(canvasScaled);

		return canvasScaled;
	}

}


module.exports.BasicTerrain = Terrain;
module.exports.ProceduralTerrain = ProceduralTerrain;
