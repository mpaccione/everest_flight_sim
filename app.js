// Imports
const THREE = require('three');
const GLTFLoader = require('three-gltf-loader');
const OrbitControls = require('three-orbit-controls')(THREE);
const Helicopter = require('./src/classes/helicopter');
const Terrain = require('./src/classes/terrain');
const Cockpit = require('./src/classes/cockpit');

////////////////
// Main Scene //
////////////////

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 20000 ),
	  renderer = new THREE.WebGLRenderer();

// Fog
scene.fog = new THREE.Fog(0xf9fbff, 500, 10000);

// Add Clouds
// const cloud = new Terrain.Clouds,
// 	  cloudObj = cloud.returnCloudObj();

// scene.add(cloudObj)

// Add Terrain
const terrain = new Terrain.ProceduralTerrain,
	  terrainObj = terrain.returnTerrainObj();

scene.add(terrainObj);

// Add SkyBox
// const tgaLoader = new TGALoader(),
// 	  materialArray = [],
//       imgArray = ["peaks_rt.tga", "peaks_lf.tga", "peaks_up.tga", "peaks_dn.tga", "peaks_ft.tga", "peaks_bk.tga"];

// tgaLoader.setPath("./src/skybox/ely_peaks/");

// for ( let i = 0; i < 6; i++ ){
//     const material = new THREE.MeshBasicMaterial({ map: tgaLoader.load( imgArray[i] ), side: THREE.BackSide });
//     materialArray.push( material );
// }

// const skyMat = new THREE.MeshFaceMaterial( materialArray ),
const skyMat = new THREE.MeshBasicMaterial({ color: 0xfffcce, side: THREE.BackSide }),
      skyGeo = new THREE.BoxGeometry( 10000, 10000, 10000, 1, 1, 1),
      sky = new THREE.Mesh( skyGeo, skyMat );

sky.name = "skybox";
sky.position.set( 0, terrain.returnCameraStartPosY(), 0 );
scene.add(sky);

// Camera
camera.name = "camera";
camera.position.z = -50;

// Lighting
const ambientLight = new THREE.AmbientLight( 0x404040 );
scene.add(ambientLight)

// Rect to Simulate Helicopter
const geometry = new THREE.BoxGeometry( 2, 1, 4 ),
	  material = new THREE.MeshBasicMaterial(),
	  rect = new THREE.Mesh( geometry, material );

rect.position.x = 0;
rect.position.y = terrain.returnCameraStartPosY();
rect.position.z = 0;
rect.rotation.order = "YXZ";
rect.name = "heli";

// Link Camera and Helicopter
const heliCam = new THREE.Group(),
	  player = new Helicopter(heliCam, "OH-58 Kiowa", 14000);

heliCam.add(camera);
heliCam.add(rect);
heliCam.position.x = 0;
heliCam.position.y = terrain.returnCameraStartPosY();
heliCam.position.z = 0;
scene.add(heliCam);

// Init Cockpit
const cockpit = new Cockpit();
cockpit.animate();

// Debugging
window.scene = scene;
window.camera = camera;

const canvas = document.getElementById("three");

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xffffff, 0.8 );
canvas.appendChild( renderer.domElement );

// Animation Loop
const animate = function () {
	requestAnimationFrame( animate );
	// Update Helicopter
	player.update();
	renderer.render( scene, camera );
};

animate();