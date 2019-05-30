// Imports
const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const Helicopter = require('./src/classes/helicopter');
const Terrain = require('./src/classes/terrain');

/////////////////////////////
// Mini Orientation Scene //
////////////////////////////

// View
const miniScene = new THREE.Scene(),
	  miniCamera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 100000 ),
	  miniRenderer = new THREE.WebGLRenderer();

// Rect to Simulate Helicopter
const miniGeometry = new THREE.BoxGeometry( 2, 1, 4 ),
	  miniMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } ),
	  miniRect = new THREE.Mesh( miniGeometry, miniMaterial );

// miniRect.position.set = 0;
// miniRect.position.y = 0;
// miniRect.position.z = 0;
miniRect.rotation.order = "YXZ";
miniRect.name = "miniHeli";

// Camera
miniCamera.name = "miniCamera";
miniCamera.position.set(0,0,-5);
// miniCamera.lookAt(miniRect);

// Group
const miniHeliRect = new THREE.Group();

// Debugging
const controls = new OrbitControls(miniCamera);
controls.enableKeys = false; // Prevent Conflict with Player Controls

// miniHeliRect.add(miniCamera);
miniHeliRect.add(miniRect);
miniHeliRect.add(new THREE.AxesHelper(2.25));
miniScene.add(miniHeliRect);
miniScene.add(miniCamera);

////////////////
// Main Scene //
////////////////

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 100000 ),
	  // camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 100000 ),
	  renderer = new THREE.WebGLRenderer();

// Add Terrain
const terrain = new Terrain.ProceduralTerrain,
	  terrainObj = terrain.returnTerrainObj();

scene.add(terrainObj);

// Camera
camera.name = "camera";
camera.position.z = -50;

// Lighting
const ambientLight = new THREE.AmbientLight( 0x404040 );
scene.add(ambientLight)

// Rect to Simulate Helicopter
const geometry = new THREE.BoxGeometry( 2, 1, 4 ),
	  material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ),
	  rect = new THREE.Mesh( geometry, material );

rect.position.x = 0;
rect.position.y = terrain.returnCameraStartPosY();
rect.position.z = 0;
rect.rotation.order = "YXZ";
rect.name = "heli";

// Link Camera and Helicopter
const heliCam = new THREE.Group(),
	  player = new Helicopter(heliCam, "Wireframe", 14000, true, miniHeliRect);

heliCam.add(camera);
heliCam.add(rect);
heliCam.position.x = 0;
heliCam.position.y = terrain.returnCameraStartPosY();
heliCam.position.z = 0;
scene.add(heliCam);

///////////////////////////
// Adding Both Renderers //
///////////////////////////

// Debugging
window.scene = scene;
window.camera = camera;
window.miniScene = miniScene;
window.miniCamera = miniCamera;

const canvas = document.getElementById("three"),
	  miniCanvas = document.getElementById("three-mini");

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xffffff, 0.8 );
canvas.appendChild( renderer.domElement );

miniRenderer.setSize( 200, 200 );
miniRenderer.setClearColor( 0xffffff, 0.8 );
miniCanvas.appendChild( miniRenderer.domElement );

// Animation Loop
const animate = function () {
	requestAnimationFrame( animate );
	player.update();
	renderer.render( scene, camera );
	miniRenderer.render( miniScene, miniCamera );
};

animate();