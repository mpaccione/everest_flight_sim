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

controls.keys = false;

// Grid for Reference
// Axis Helper X: Red, Y: Green, Z: Blue
const axisHelper = new THREE.AxisHelper(8000),
	  gridSize = 8000,
	  gridDivisions = 10;
	  gridArr =  [];

scene.add(axisHelper);

console.log(terrainData);

for (var i = 0; i < 4; i++) {
	const grid = new THREE.GridHelper(gridSize, gridDivisions);
	grid.position.set(0, 0, (gridSize * -i))
	gridArr.push(grid);
}

for (var i = 0; i < gridArr.length; i++) {
	scene.add(gridArr[i]);
}

for (var j = 0; j < 4; j++) {
	const gridTile = terrainData[j];
	for (var k = 0; k < gridTile.length; k++) {
		const subGridTile = gridTile[k];
		// Row
		for (var a = 0; a < subGridTile.length; a++) {
			// Column
			for (var b = 0; b < subGridTile[a].length; b++) {
				const elevation = subGridTile[a][b]["elevation"],
					  geometry = new THREE.BoxGeometry( 800, elevation, 800 ),
					  material = new THREE.MeshBasicMaterial( {wireframe: false, color: colorData(elevation)} ),
					  cube = new THREE.Mesh( geometry, material );

				console.log(elevation);
				console.log(`${0}, ${a*800}, ${b*800}`);

				cube.position.set( (a*800)-4000, 2000, ((b*800)-4000)+(j*-4000) )
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
      this.pickedObjectSavedColor = 0;
    }

    pick(normalizedPosition, scene, camera, time) {
      // restore the color if there is a picked object
      if (this.pickedObject) {
        // this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }

      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
        // save its color
        // this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
        // set its emissive color to flashing red/yellow
        // this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
        this.pickedObject.material.color.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
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
camera.position.z = 5000;
camera.position.y = 5000;
// camera.lookAt(miniHeliGroup.position);

// Debugging
window.scene = scene;
window.camera = camera;
document.body.innerHTML += `<div id="debugging-stats"></div>`;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xffffff, 0.9);
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