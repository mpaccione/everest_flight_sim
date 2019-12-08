// Imports
const THREE = require('three');
const GLTFLoader = require('three-gltf-loader');
const Helicopter = require('./src/classes/helicopter');
const OrbitControls = require('three-orbit-controls')(THREE);
const terrainData = require('./Grid_Output_Everest_10.json');

////////////////////////////////
///// THREE BUFFER UTILITY /////
////////////////////////////////

const BufferGeometryUtils = {

	computeTangents: function ( geometry ) {

		var index = geometry.index;
		var attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.warn( 'THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()' );
			return;

		}

		var indices = index.array;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var uvs = attributes.uv.array;

		var nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.addAttribute( 'tangent', new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		var tangents = attributes.tangent.array;

		var tan1 = [], tan2 = [];

		for ( var i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new THREE.Vector3();
			tan2[ i ] = new THREE.Vector3();

		}

		var vA = new THREE.Vector3(),
			vB = new THREE.Vector3(),
			vC = new THREE.Vector3(),

			uvA = new THREE.Vector2(),
			uvB = new THREE.Vector2(),
			uvC = new THREE.Vector2(),

			sdir = new THREE.Vector3(),
			tdir = new THREE.Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			var x1 = vB.x - vA.x;
			var x2 = vC.x - vA.x;

			var y1 = vB.y - vA.y;
			var y2 = vC.y - vA.y;

			var z1 = vB.z - vA.z;
			var z2 = vC.z - vA.z;

			var s1 = uvB.x - uvA.x;
			var s2 = uvC.x - uvA.x;

			var t1 = uvB.y - uvA.y;
			var t2 = uvC.y - uvA.y;

			var r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		var groups = geometry.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(), n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	},

	/**
	 * @param  {Array<BufferGeometry>} geometries
	 * @param  {Boolean} useGroups
	 * @return {BufferGeometry}
	 */
	mergeBufferGeometries: function ( geometries, useGroups ) {

		var isIndexed = geometries[ 0 ].index !== null;

		var attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		var morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		var attributes = {};
		var morphAttributes = {};

		var mergedGeometry = new THREE.BufferGeometry();

		var offset = 0;

		for ( var i = 0; i < geometries.length; ++ i ) {

			var geometry = geometries[ i ];

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) return null;

			// gather attributes, exit early if they're different

			for ( var name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) return null;

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

			}

			// gather morph attributes, exit early if they're different

			for ( var name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) return null;

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push( geometry.userData );

			if ( useGroups ) {

				var count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			var indexOffset = 0;
			var mergedIndex = [];

			for ( var i = 0; i < geometries.length; ++ i ) {

				var index = geometries[ i ].index;

				for ( var j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( var name in attributes ) {

			var mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) return null;

			mergedGeometry.addAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( var name in morphAttributes ) {

			var numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( var i = 0; i < numMorphTargets; ++ i ) {

				var morphAttributesToMerge = [];

				for ( var j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				var mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) return null;

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	},

	/**
	 * @param {Array<BufferAttribute>} attributes
	 * @return {BufferAttribute}
	 */
	mergeBufferAttributes: function ( attributes ) {

		var TypedArray;
		var itemSize;
		var normalized;
		var arrayLength = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			var attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) return null;

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) return null;

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) return null;

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) return null;

			arrayLength += attribute.array.length;

		}

		var array = new TypedArray( arrayLength );
		var offset = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new THREE.BufferAttribute( array, itemSize, normalized );

	}

};

////////////////////
///// RUNTIME /////
///////////////////

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000000 ),
	  renderer = new THREE.WebGLRenderer(),
	  controls = new OrbitControls(camera);

let time;

controls.keys = false;

// Group
const miniHeliGroup = new THREE.Group();

// Load Helicopter Model
const miniModelLoader = new GLTFLoader();

console.log("UPDATED");

miniModelLoader.load( './src/models/helicopter/scene.gltf', function(gltf){
	miniModel = gltf.scene;
	miniModel.name = "miniHeli"
	miniModel.rotation.y = -90 * Math.PI / 180; // Radians

    let miniModelMesh = miniModel.children[0].children[0].children[0],
    	miniModelMeshArr = [ miniModelMesh.children[0], miniModelMesh.children[1], miniModelMesh.children[2] ];

    for (var i = miniModelMeshArr.length - 1; i >= 0; i--) {
    	miniModelMeshArr[i].name = "mesh"+i;		
    	miniModelMeshArr[i].material.wireframe = true;
    }

    miniHeliGroup.add( new THREE.AxesHelper(500) );
	miniHeliGroup.add( miniModel );
	miniHeliGroup.position.set( 0, 6000, 0 );
	scene.add(miniHeliGroup);
} )

// Initiate 
const player = new Helicopter(miniHeliGroup, "Wireframe", 14000);

// Grid for Reference
// Axis Helper X: Red, Y: Green, Z: Blue
const axisHelper = new THREE.AxisHelper(8000),
	  gridSize = 8000,
	  gridDivisions = 10,
	  gridArr = [];

scene.add(axisHelper);

// BOXES 

for (var j = 0; j < terrainData.length; j++) {
	const gridTile = terrainData[j];
	for (var k = 0; k < gridTile.length; k++) {
		const subGridTile = gridTile[k],
			  geometry = new THREE.BoxBufferGeometry( 800, 3500, 800 ),
			  material = new THREE.MeshBasicMaterial( {wireframe: true, color: colorData(3500)} ),
			  cube = new THREE.Mesh( geometry, material );

		cube.position.set( (j*800), 0, (k*800) );
		cube.name = `${k}-${j}`;

		scene.add(cube)
	}
}

console.log(scene);

function colorData(meters) {
	let rgbString = "",
	    r         = parseInt((meters/8848) * 255),
	    g         = 255 - r;

	r = r < 0 ? 0 : r;
	rgbString = `rgb(${r},${g}, 0)`;
	return rgbString;
}

function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement,
		  width = canvas.clientWidth,
		  height = canvas.clientHeight,
		  needResize = canvas.width !== width || canvas.height !== height;

	if (needResize) {
	  renderer.setSize(width, height, false);
	}

	return needResize;
}

// Quick and Dirty Global
let currentGridCoord = [0,0]; 

colorGrids(currentGridCoord);
setInterval(function(){
	console.log("interval");
	gridCheck(currentGridCoord, 800);
}, 2000)

function gridCheck(currentGridRef, gridSize){
	let changed = false,
		currentGrid = JSON.parse(JSON.stringify(currentGridRef));

	// Latitude
	if (window.flightSim.z > (currentGrid[1] * gridSize) + gridSize) {
		// Increase Latitude Grid Count
		resetGrid(`${currentGrid[1]}-${currentGrid[0] - 1}`)		
		currentGridCoord[1] = currentGrid[1] + 1; 
		console.log("changed1");
		changed = true;
	} else if (window.flightSim.z < (currentGrid[1] * gridSize) - gridSize) {
		// Decrease Latitude Grid Count
		resetGrid(`${currentGrid[1]}-${currentGrid[0] + 1}`)		
		currentGridCoord[1] = (currentGrid[1] - 1) > 0 ? (currentGrid[1] - 1) : 0; 
		console.log("changed2");
		changed = true;
	}	
	// Longitude
	if (window.flightSim.x > (currentGrid[0] * gridSize) + gridSize) {
		// Increase Longitude Grid Count
		resetGrid(`${currentGrid[1] - 1}-${currentGrid[0]}`)
		currentGridCoord[0] = currentGrid[0] + 1; 
		console.log("changed3");
		changed = true;
	} else if (window.flightSim.x < (currentGrid[0] * gridSize) - gridSize) {
		// Decrease Longitude Grid Count
		resetGrid(`${currentGrid[1] + 1}-${currentGrid[0]}`)		
		currentGridCoord[0] = (currentGrid[0] - 1) > 0 ? (currentGrid[0] - 1) : 0;
		console.log("changed4");
		changed = true;
	}

	console.log("changed "+changed);

	if (changed) {
		colorGrids(currentGridCoord);
	}
}

function resetGrid(grid){
	// console.log("resetGrid");
	// console.log(grid);
	const obj = scene.getObjectByName(grid);
	if (obj) {
		obj.material.wireframe = true;
		obj.material.color.setHex(0x286400);
	}
}

function colorGrids(currentGrid){
	// console.log("colorGrids");
	// console.log(currentGrid);
	const start1 = (currentGridCoord[0] - 1) //> 0 ? (currentGridCoord[0] - 1) : 0,
	const start2 = (currentGridCoord[1] - 1) //> 0 ? (currentGridCoord[1] - 1) : 0;



	for (var j = start1; j < (start1 + 3); j++) {
		for (var k = start2; k < (start2 + 3); k++) {
			console.log(`k:${k}-j:${j}`);
			const obj = scene.getObjectByName(`${k}-${j}`);
			if (obj) {
				obj.material.color.setHex(0x0000FF);
				obj.material.wireframe = false;
			}
		}
	}
	// console.log("currentGrid");
	// console.log(`${currentGrid[0]}-${currentGrid[1]}`);
	const obj = scene.getObjectByName(`${currentGridCoord[1]}-${currentGridCoord[0]}`);
	console.log("obj");
	console.log(obj);
	if (obj){
		obj.material.color.setHex(0xFF0000);
		obj.material.wireframe = false;
	}
}

// class PickHelper {
//     constructor() {
//       this.raycaster = new THREE.Raycaster();
//       this.pickedObject = null;
//       this.oldPickedObject = null;
//       this.pickedObjectSavedColor = 0;
//       this.currentGrid = null;
//       this.oldGrid = null;
//     }

//     gridPick(parentGrid, hex){
//     	for (var b = 0; b < 10; b++) {
//         	for (var a = 0; a < 10; a++) {
//         		const obj = window.scene.getObjectByName(`${parentGrid}-${b}-${a}`);
//         		if (obj) {
// 		        	obj.material.color.setHex( hex );
// 		        }
//         	}
//         }
//     }

//     gridPickOld(parentGrid, hex){
//     	for (var b = 0; b < 10; b++) {
//         	for (var a = 0; a < 10; a++) {
//         		const obj = window.scene.getObjectByName(`${parentGrid}-${b}-${a}`);
//         		if (obj) {
// 		        	obj.material.color.setHex( hex );
// 		        	obj.material.wireframe = true;
// 		        }
//         	}
//         }
//     }

//     gridUpdate(newGrid){
//     	if (this.currentGrid !== newGrid) {
//     		// change grid state
//     		this.oldGrid = this.currentGrid;
//     		if (this.oldGrid !== null) {
//     			this.gridPickOld(this.oldGrid, this.pickedObjectSavedColor);
//     		}
//     		this.currentGrid = newGrid;
//     	}
//     }

//     pick(normalizedPosition, scene, camera, time) {
// 		// restore the color if there is a picked object
// 		if (this.pickedObject) {
// 			const gridName = this.pickedObject.name.substring(0, 3);
// 			this.gridPick(gridName, 0x0000FF);
// 			this.gridUpdate(gridName);
// 			this.pickedObject.material.color.setHex(this.pickedObjectSavedColor)
// 			this.pickedObject.material.wireframe = false;
// 			if (this.oldPickedObject !== null && this.oldPickedObject.name !== this.pickedObject.name) {
// 				this.oldPickedObject.material.wireframe = true;
// 			}
// 			this.oldPickedObject = this.pickedObject;
// 			this.pickedObject = undefined;
// 		}

// 		// cast a ray through the frustum
// 		this.raycaster.setFromCamera(normalizedPosition, camera);
// 		// get the list of objects the ray intersected
// 		const intersectedObjects = this.raycaster.intersectObjects(scene.children);

//     	if (intersectedObjects.length) {
// 	        // pick the first object. It's the closest one
// 	        this.pickedObject = intersectedObjects[0].object;
// 	        const gridName = this.pickedObject.name.substring(0, 3);
// 	        // save its color
// 	        this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
// 	        // set its color to red
// 	       	this.gridPick(gridName, 0x0000FF);
// 	       	this.gridUpdate(gridName);
// 	       	this.pickedObject.material.color.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000)
// 	        // Update Debugger
// 	        const html = `<ul>
// 							<li>Global Grid: [${this.pickedObject.userData.lat}][${this.pickedObject.userData.long}][${this.pickedObject.userData.subLat}][${this.pickedObject.userData.subLong}]</li>
// 							<br>
// 							<li>Parent Grid: ${this.pickedObject.userData.lat}-${this.pickedObject.userData.long}</li>
// 							<li>Sub Grid: ${this.pickedObject.userData.subLat}-${this.pickedObject.userData.subLong}</li>
// 							<br>
// 							<li>Elevation: ${this.pickedObject.userData.elevation}</li>
// 							<li>Latitude: ${this.pickedObject.userData.latitude}</li>
// 							<li>Longitude: ${this.pickedObject.userData.longitude}</li>
// 						</ul>`;

// 	        document.querySelector("#debugging-stats").innerHTML = html;
//     	} else {
// 	    	const html = `<ul>
// 							<li>Global Grid:</li>
// 							<br>
// 							<li>Parent Grid:</li>
// 							<li>Sub Grid:</li>
// 							<br>
// 							<li>Elevation:</li>
// 							<li>Latitude:</li>
// 							<li>Longitude:</li>
// 						</ul>`;

// 	        document.querySelector("#debugging-stats").innerHTML = html;
// 	    }
//     }
// }

function getCanvasRelativePosition(event) {
	// const rect = document.querySelectorAll('canvas')[0].getBoundingClientRect();

	return {
	  x: event.clientX - 0,
	  y: event.clientY - 0,
	};
}

function setPickPosition(event) {
	const pos = getCanvasRelativePosition(event);
	pickPosition.x = (pos.x / window.innerWidth ) *  2 - 1;
	pickPosition.y = (pos.y / window.innerHeight) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
	// unlike the mouse which always has a position
	// if the user stops touching the screen we want
	// to stop picking. For now we just pick a value
	// unlikely to pick something
	pickPosition.x = -100000;
	pickPosition.y = -100000;
}


// const pickPosition = {x: 0, y: 0};
// const pickHelper = new PickHelper();
// clearPickPosition();

// Mouse Picker Listeners
// window.addEventListener('mousemove', setPickPosition);
// window.addEventListener('mouseout', clearPickPosition);
// window.addEventListener('mouseleave', clearPickPosition);

// window.addEventListener('touchstart', (event) => {
// 	// prevent the window from scrolling
// 	event.preventDefault();
// 	setPickPosition(event.touches[0]);
// }, {passive: false});

// window.addEventListener('touchmove', (event) => {
// 	setPickPosition(event.touches[0]);
// });

// window.addEventListener('touchend', clearPickPosition);

// Camera
camera.name = "camera";
camera.position.x = 38790;
camera.position.y = 43700; 
camera.position.z = 14710;
camera.lookAt(scene.getObjectByName('4-4').position);
controls.update();
camera.lookAt(scene.getObjectByName('4-4').position);

// Debugging
window.scene = scene;
window.camera = camera;
window.controls = controls;
document.body.innerHTML += `<div id="debugging-stats"></div>`;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xffffff, 1);
document.body.appendChild( renderer.domElement );

// Animation Loop
const animate = function () {
	if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    time *= 0.001;
    // pickHelper.pick(pickPosition, scene, camera, time);
	requestAnimationFrame( animate );
	player.update();
	renderer.render( scene, camera );
};

animate();