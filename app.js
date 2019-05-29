// Imports
const THREE = require('three');
// const OrbitControls = require('three-orbit-controls')(THREE);
const Helicopter = require('./classes/helicopter');

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
	  renderer = new THREE.WebGLRenderer();
	  // controls = new OrbitControls(camera);
	  // loader = new THREE.TGALoader();

// Debugging
window.scene = scene;
window.camera = camera;

// loader.setPath('./src/skybox/ely_peaks/')
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xffffff, 0.5);
document.body.appendChild( renderer.domElement );

// Skybox
// const imgArray = ["peaks_rt.tga", "peaks_lf.tga", "peaks_ft.tga", "peaks_dn.tga", "peaks_up.tga", "peaks_bk.tga"];
// let materialArray = [];

// for (let i = 0; i < 6; i++){
//     const material = new THREE.MeshBasicMaterial({ map: loader.load( imgArray[i] ), side: THREE.BackSide });
//     materialArray.push( material );
// }

// const skyboxMaterial = new THREE.MeshFaceMaterial( materialArray ),
// 	  skyGeo = new THREE.BoxGeometry( 5000, 5000, 5000, 1, 1, 1),
// 	  sky = new THREE.Mesh(skyGeo, skyboxMaterial);

// sky.name = "skybox";
// scene.add(sky);

// Grid for Reference
const gridSize = 100,
	  gridDivisions = 10,
	  gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

scene.add(gridHelper);

// Cube to Simulate Helicopter
const geometry = new THREE.BoxGeometry( 1, 1, 1 ),
	  material = new THREE.MeshBasicMaterial( { color: 0x00ff00, } ),
	  cube = new THREE.Mesh( geometry, material );

cube.rotation.order = "YXZ";
cube.name = "heli";

scene.add( cube );
camera.name = "camera";
camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 0;
camera.lookAt(cube.position);


// Initiate Helicopter
const player = new Helicopter(cube);


const animate = function () {
	requestAnimationFrame( animate );

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render( scene, camera );
};

animate();