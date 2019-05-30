// Imports
const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const Helicopter = require('./src/classes/helicopter');
const Terrain = require('./src/classes/terrain');

// View
const scene = new THREE.Scene(),
	  // camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
	  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 ),
	  renderer = new THREE.WebGLRenderer();

// Debugging
const controls = new OrbitControls(camera);
controls.enableKeys = false; // Prevent Conflict with Player Controls

// Cube to Simulate Helicopter
const geometry = new THREE.BoxGeometry( 2, 1, 4 ),
	  material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ),
	  rect = new THREE.Mesh( geometry, material );

rect.rotation.order = "YXZ";
rect.name = "heli";
scene.add( rect );

// Initiate Helicopter
const player = new Helicopter(rect, "Wireframe", 14000);

// Add Terrain
const terrain = new Terrain.ProceduralTerrain,
	  terrainObj = terrain.returnTerrainObj();

console.log(terrainObj);
scene.add(terrainObj);

// Camera
camera.name = "camera";
camera.position.z = -50;
camera.position.y = 10;
camera.position.x = 0;

// Lighting
const ambientLight = new THREE.AmbientLight( 0x404040 );
scene.add(ambientLight)

// Debugging
window.scene = scene;
window.camera = camera;
document.body.innerHTML += `<div id="debugging-stats"></div>`;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xffffff, 0.15 );
document.body.appendChild( renderer.domElement );

// Animation Loop
const animate = function () {
	requestAnimationFrame( animate );
	player.update();
	renderer.render( scene, camera );
};

animate();