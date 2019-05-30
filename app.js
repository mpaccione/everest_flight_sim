// Imports
const THREE = require('three');
const Helicopter = require('./classes/helicopter');

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
	  renderer = new THREE.WebGLRenderer();

// Cube to Simulate Helicopter
const geometry = new THREE.BoxGeometry( 2, 1, 4 ),
	  material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ),
	  rect = new THREE.Mesh( geometry, material );

rect.rotation.order = "YXZ";
rect.name = "heli";
scene.add( rect );

// Initiate Helicopter
const player = new Helicopter(rect, "Wireframe", 14000);

// Grid for Reference
const gridSize = 100,
	  gridDivisions = 10,
	  gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

scene.add(gridHelper);

// Camera
camera.name = "camera";
camera.position.z = 60;
camera.position.y = 60;
camera.position.x = 15;
camera.lookAt(rect.position);

// Debugging
window.scene = scene;
window.camera = camera;
document.body.innerHTML += `<div id="debugging-stats"></div>`;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xffffff, 0.15);
document.body.appendChild( renderer.domElement );

// Animation Loop
const animate = function () {
	requestAnimationFrame( animate );
	player.update()
	renderer.render( scene, camera );
};

animate();