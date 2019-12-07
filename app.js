// Imports
const THREE = require('three');
const GLTFLoader = require('three-gltf-loader');
const Helicopter = require('./src/classes/helicopter');
const OrbitControls = require('three-orbit-controls')(THREE);
const terrainData = require('./Grid_Output_Everest_10.json');

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000000 ),
	  renderer = new THREE.WebGLRenderer(),
	  controls = new OrbitControls(camera);

let time;

// Grid for Reference
// Axis Helper X: Red, Y: Green, Z: Blue
const axisHelper = new THREE.AxisHelper(8000),
	  gridSize = 8000,
	  gridDivisions = 10,
	  gridArr =  [];

scene.add(axisHelper);

// BOXES 

for (var j = 0; j < terrainData.length; j++) {
	const gridTile = terrainData[j];
	for (var k = 0; k < gridTile.length; k++) {
		const subGridTile = gridTile[k];
		// Column
		for (var a = 0; a < subGridTile.length; a++) {
			// Row
			for (var b = 0; b < subGridTile[a].length; b++) {
				const elevation = subGridTile[a][b]["elevation"],
					  latitude = subGridTile[a][b]["latitude"],
					  longitude = subGridTile[a][b]["longitude"],
					  geometry = new THREE.BoxGeometry( 800, elevation, 800 ),
					  material = new THREE.MeshBasicMaterial( {wireframe: true, color: colorData(elevation)} ),
					  cube = new THREE.Mesh( geometry, material );

				// console.log(elevation);
				// console.log(`${0}, ${a*800}, ${b*800}`);

				cube.userData = {
					lat: k,
					long: j, 
					subLat: b,
					subLong: a,
					elevation: elevation,
					latitude: latitude,
					longitude: longitude
				}
				cube.name = `${k}-${j}-${b}-${a}`;
				cube.position.set( (a*800)+(j*8000), 2000, (b*-800)+(k*-8000) )

				scene.add( cube );
			}
		}
		// lat -> Z axis
		// long -> X axis
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

class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.oldPickedObject = null;
      this.pickedObjectSavedColor = 0;
      this.currentGrid = null;
      this.oldGrid = null;
    }

    gridPick(parentGrid, hex){
    	console.log('gridPick');
    	for (var b = 0; b < 10; b++) {
        	for (var a = 0; a < 10; a++) {
        		const obj = window.scene.getObjectByName(`${parentGrid}-${b}-${a}`);
        		if (obj) {
		        	obj.material.color.setHex( hex );
		        }
        	}
        }
    }

    gridPickOld(parentGrid, hex){
    	console.log('gridPickOld');
    	for (var b = 0; b < 10; b++) {
        	for (var a = 0; a < 10; a++) {
        		const obj = window.scene.getObjectByName(`${parentGrid}-${b}-${a}`);
        		if (obj) {
		        	obj.material.color.setHex( hex );
		        	obj.material.wireframe = true;
		        }
        	}
        }
    }

    gridUpdate(newGrid){
    	if (this.currentGrid !== newGrid) {
    		// change grid state
    		this.oldGrid = this.currentGrid;
    		if (this.oldGrid !== null) {
    			this.gridPickOld(this.oldGrid, this.pickedObjectSavedColor);
    		}
    		this.currentGrid = newGrid;
    	}
    }

    pick(normalizedPosition, scene, camera, time) {
    	console.log("this.currentGrid");
    	console.log(this.currentGrid);
    	console.log("this.oldGrid");
    	console.log(this.oldGrid);
		// restore the color if there is a picked object
		if (this.pickedObject) {
			const gridName = this.pickedObject.name.substring(0, 3);
			this.gridPick(gridName, 0x0000FF);
			this.gridUpdate(gridName);
			this.pickedObject.material.color.setHex(this.pickedObjectSavedColor)
			this.pickedObject.material.wireframe = false;
			if (this.oldPickedObject !== null && this.oldPickedObject.name !== this.pickedObject.name) {
				this.oldPickedObject.material.wireframe = true;
			}
			this.oldPickedObject = this.pickedObject;
			this.pickedObject = undefined;
		}

		// cast a ray through the frustum
		this.raycaster.setFromCamera(normalizedPosition, camera);
		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(scene.children);

    	if (intersectedObjects.length) {
	        // pick the first object. It's the closest one
	        this.pickedObject = intersectedObjects[0].object;
	        const gridName = this.pickedObject.name.substring(0, 3);
	        // save its color
	        this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
	        // set its color to red
	       	this.gridPick(gridName, 0x0000FF);
	       	this.gridUpdate(gridName);
	       	this.pickedObject.material.color.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000)
	        // Update Debugger
	        const html = `<ul>
							<li>Global Grid: [${this.pickedObject.userData.lat}][${this.pickedObject.userData.long}][${this.pickedObject.userData.subLat}][${this.pickedObject.userData.subLong}]</li>
							<br>
							<li>Parent Grid: ${this.pickedObject.userData.lat}-${this.pickedObject.userData.long}</li>
							<li>Sub Grid: ${this.pickedObject.userData.subLat}-${this.pickedObject.userData.subLong}</li>
							<br>
							<li>Elevation: ${this.pickedObject.userData.elevation}</li>
							<li>Latitude: ${this.pickedObject.userData.latitude}</li>
							<li>Longitude: ${this.pickedObject.userData.longitude}</li>
						</ul>`;

	        document.querySelector("#debugging-stats").innerHTML = html;
    	} else {
	    	const html = `<ul>
							<li>Global Grid:</li>
							<br>
							<li>Parent Grid:</li>
							<li>Sub Grid:</li>
							<br>
							<li>Elevation:</li>
							<li>Latitude:</li>
							<li>Longitude:</li>
						</ul>`;

	        document.querySelector("#debugging-stats").innerHTML = html;
	    }
    }
}

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


const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
clearPickPosition();

// Mouse Picker Listeners
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

window.addEventListener('touchstart', (event) => {
	// prevent the window from scrolling
	event.preventDefault();
	setPickPosition(event.touches[0]);
}, {passive: false});

window.addEventListener('touchmove', (event) => {
	setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);

// Camera
camera.name = "camera";
camera.position.x = 38790;
camera.position.y = 43700; 
camera.position.z = 14710;
camera.lookAt(scene.getObjectByName('4-4-9-9').position);
controls.update();
camera.lookAt(scene.getObjectByName('4-4-9-9').position);

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
    pickHelper.pick(pickPosition, scene, camera, time);

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
};

animate();