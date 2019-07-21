const THREE = require('THREE');
const ImprovedNoise = require('improved-noise');

function vertexHeightShader(){
    return `
        varying float vertXPos;
        varying float vertYPos; 

        void main() {              
          vec4 localPosition = vec4( position, 1.0 );
          vec4 worldPosition = modelMatrix * localPosition;

          vertXPos = position.x;
          vertYPos = position.y; 
         
          gl_Position = projectionMatrix * viewMatrix * worldPosition; 
        }
    `
}

function fragmentHeightShader(){
    return `
        precision mediump float;

        varying float vertXPos;
        varying float vertYPos;

        vec3 color_from_height( const float height ) {
            vec3 terrain_colors[5];

            terrain_colors[0] = vec3( 0.506, 0.898, 0.976 ); // Light Blue Water
            terrain_colors[1] = vec3( 0.016, 0.530, 0.023 ); // Green Forest
            terrain_colors[2] = vec3( 0.501, 0.416, 0.167 ); // Brown Gravel
            terrain_colors[3] = vec3( 0.729, 0.749, 0.776 ); // Blue Gray Icy Rock
            terrain_colors[4] = vec3( 0.949, 0.969, 0.976 ); // White Snow

            // return vec3( vertYPos*0.001, 0.0, 0.0 ); // Testing

            if (height < 0.0){
                return terrain_colors[0];
            } else {
                float hscaled = height*1.0;       // hscaled should range in [0,2]
                int hi = int(hscaled);            // hi should range in [0,1]
                float hfrac = hscaled-float(hi);  // hfrac should range in [0,1]

                if ( hscaled < 0.1 )
                	return terrain_colors[0];
                else if ( hscaled > 0.1 && hscaled < 0.33 )
                    return mix( terrain_colors[1], terrain_colors[2], hfrac); // blends between the two colors    
                else if ( hscaled > 0.33 && hscaled < 0.66 )    
                    return mix( terrain_colors[2], terrain_colors[3], hfrac); // blends between the two colors
                else if ( hscaled > 0.66 && hscaled < 1.0 )
                  	return mix( terrain_colors[3], terrain_colors[4], hfrac); // blends between the two colors
            	else
            	 	return terrain_colors[4];
            }

            return vec3( 0.0, 0.0, 0.0 );
        }

        void main() {
            vec3 color = color_from_height( vertYPos*0.001 );
            gl_FragColor = vec4( color, 1.0 );
        }
    `
}


function vertexSplatShader(){
	return `
		varying float vertXPos;
        varying float vertYPos;
	    varying vec2 vUv; 

	    void main() {
			vUv = uv;
			vec4 localPosition = vec4( position, 1.0 );
			vec4 worldPosition = modelMatrix * localPosition;

			vertXPos = position.x;
			vertYPos = position.y;  

	    	gl_Position = projectionMatrix * viewMatrix * worldPosition;
	    }
	`
}

function fragmentSplatShader(){
	return `
		precision mediump float;

		uniform sampler2D waterTexture;
		uniform sampler2D forestTexture;
		uniform sampler2D gravelTexture;
		uniform sampler2D rockTexture;
		uniform sampler2D snowTexture;

		varying float vAmount;
		varying vec2 vUv;
		varying float vertXPos;
        varying float vertYPos;

		void main() {
			float height = vertYPos * 0.001;

			vec4 water  =  (smoothstep(-1.0, 0.1, height)  - smoothstep(0.1, 0.1, height))	 * texture2D( waterTexture, vUv * 100.0 );
			vec4 forest =  (smoothstep(-1.0, 0.4, height)  - smoothstep(0.4, 0.7, height))    * texture2D( forestTexture, vUv * 100.0 );
		    vec4 gravel =  (smoothstep(0.4, 0.8, height)  - smoothstep(0.8, 1.1, height))    * texture2D( gravelTexture, vUv * 100.0 );
		    vec4 rocky  =  (smoothstep(0.8, 1.1, height) - smoothstep(1.1, 1.4, height))    * texture2D( rockTexture, vUv * 100.0 );
		    vec4 snow   =  (smoothstep(1.1, 1.4, height)                                )  * texture2D( snowTexture, vUv * 100.0 );
		    
		    vec4 fragTexture = vec4(0.0, 0.0, 0.0, 1.0) + water + forest + gravel + rocky + snow;

		    gl_FragColor = fragTexture;
		}
	`
}

class Clouds {
	constructor( x = 0, y = 0, z = 0, amount = 50, spread = 10 ){
		this.x = x;
		this.y = y;
		this.z = z;
		this.amount = amount;
		this.spread = spread;
	}

	returnCloudObj(){
		const spriteMap = new THREE.TextureLoader().load('./src/img/cloud2.png'),
			  spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff }),
			  spriteGroup = new THREE.Group();

		for (var i = this.amount - 1; i >= 0; i--) {
			const sprite = new THREE.Sprite( spriteMaterial ),
				  x = Math.random() * this.spread,
				  y = Math.random() * this.spread,
				  z = Math.random() * this.spread;

			sprite.position.set( x, y, z );
			spriteGroup.add( sprite );
		}
			  
		spriteGroup.position.set( this.x, this.y, this.z );
		spriteGroup.name = "spriteGroup";

		return spriteGroup;
	}	
}

class Terrain {

	constructor( width = 10000, length = 10000, xVerts = 256, yVerts = 256 ){
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

	constructor( worldWidthVerts = 1024, worldLengthVerts = 1024 ){
		super();
		this.worldWidthVerts = worldWidthVerts;
		this.worldLengthVerts = worldLengthVerts;
		this.worldHalfWidth = worldWidthVerts/2;
		this.worldHalfDepth = worldLengthVerts/2;
		this.data = this.generateHeight( worldWidthVerts, worldLengthVerts );
	}

	returnCameraStartPosY(){
		return this.data[ this.worldHalfWidth + this.worldHalfDepth * this.worldWidthVerts ] * 10 + 500;
	}

	returnTerrainObj(){
		const terrainGeom =  new THREE.PlaneBufferGeometry( 20000, 20000, this.worldWidthVerts - 1, this.worldLengthVerts - 1 ),
			  texture = new THREE.ShaderMaterial({
			  	uniforms: {
					waterTexture: { type: "t", value: THREE.ImageUtils.loadTexture("./src/img/water.jpg") },
					forestTexture: { type: "t", value: new THREE.TextureLoader().load("./src/img/shrub.png") },
					gravelTexture: { type: "t", value: new THREE.TextureLoader().load("./src/img/gravel.jpg") },
					// stoneTexture: { type: "t", value: new THREE.TextureLoader().load("./src/img/stone.png") },
					rockTexture: { type: "t", value: new THREE.TextureLoader().load("./src/img/icy_rock.jpg") },
					snowTexture: { type: "t", value: new THREE.TextureLoader().load("./src/img/snow.jpg") }
			  	},
			  	fragmentShader: fragmentSplatShader(),
			  	vertexShader: vertexSplatShader()
			  });

		let vertices = terrainGeom.attributes.position.array;
		
		terrainGeom.rotateX( - Math.PI / 2 );

		for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
			vertices[ j + 1 ] = this.data[ i ] * 10;
		}

		const terrain = new THREE.Mesh( terrainGeom, texture );

		// const texture = new THREE.ShaderMaterial({
		// 	  	uniforms: {
		// 	  		iResolution: { type: 'v2', value: new THREE.Vector2( 800 , 800 ) },
		// 	  	},
		// 	  	fragmentShader: fragmentHeightShader(),
		// 	  	vertexShader: vertexHeightShader(),
		// 	  	light: true
		// 	  }),
		// 	  terrain = new THREE.Mesh( terrainGeom, texture );

		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;

		terrain.name = "terrain";

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

class Helipad {

	constructor( x, y, z, text = false, enabled = true, radiusTop = 120, radiusBottom = 120, radialSegments = 32, heightSegments = 20 ){
		this.x = x;
		this.y = y;
		this.z = z;
		this.radiusTop = radiusTop;
		this.radiusBottom = radiusBottom;
		this.radialSegments = radialSegments;
		this.heightSegments = heightSegments;
		this.text = text;
	}

	returnHelipadObj(){
		const fontLoader = new THREE.FontLoader(),
			  helipadGroup = new THREE.Group();

		fontLoader.load('./node_modules/three/examples/fonts/helvetiker_regular.typeface.json', ( font ) => {
			const helipadGeom = new THREE.CylinderBufferGeometry( this.radiusTop, this.radiusBottom, this.radialSegments, this.heightSegments ),
				  helipadTexture = new THREE.TextureLoader().load('./src/img/helipad2.jpg'),
				  helipadMatArr = [
				  	new THREE.MeshBasicMaterial({ color: 0x68696e }),
				  	new THREE.MeshBasicMaterial({ map: helipadTexture }),
				  	new THREE.MeshBasicMaterial({ color: 0x68696e })
				  ],
				  helipad = new THREE.Mesh( helipadGeom, new THREE.MeshFaceMaterial( helipadMatArr ) ),
				  helipadTextGeo = new THREE.TextGeometry( this.text, {
					font: font,
					size: 80,
					height: 5,
					curveSegments: 12,
					bevelEnabled: false
				  } ),
				  helipadTextColor = this.enabled == true ? 0x00ff00 : 0xff0000,
				  helipadTextMat = new THREE.MeshBasicMaterial({ color: helipadTextColor }),
				  helipadText = new THREE.Mesh( helipadTextGeo, helipadTextMat );

			helipad.name = "helipad";
			helipadText.name = "helipadText"+this.text;
			helipad.position.set( 0, 0, 0 )
			helipadText.position.set( -100, 300, 0 );

			helipadGroup.add( helipad );
			helipadGroup.add( helipadText );
			helipadGroup.position.set( this.x, this.y, this.z );
			helipadGroup.name = "helipad"+this.text;
		})

		return helipadGroup;
	}

}


module.exports.Clouds = Clouds;
module.exports.BasicTerrain = Terrain;
module.exports.ProceduralTerrain = ProceduralTerrain;
module.exports.Helipad = Helipad;
