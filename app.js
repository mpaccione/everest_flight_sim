// Imports
const THREE = require('three');
const Helicopter = require('./classes/helicopter');
// const OrbitControls = require('three-orbit-controls')(THREE);

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
	  renderer = new THREE.WebGLRenderer();
	  // controls = new OrbitControls(camera);
	  // loader = new THREE.TGALoader();

// Cube to Simulate Helicopter
const geometry = new THREE.BoxGeometry( 1, 1, 1 ),
	  material = new THREE.MeshBasicMaterial( { color: 0x00ff00, } ),
	  cube = new THREE.Mesh( geometry, material );

cube.rotation.order = "YXZ";
cube.name = "heli";
scene.add( cube );

// Initiate Helicopter
const player = new Helicopter(cube);

// Grid for Reference
const gridSize = 100,
	  gridDivisions = 10,
	  gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

scene.add(gridHelper);

// Camera
camera.name = "camera";
camera.position.z = 60;
camera.position.y = 60;
camera.position.x = 0;
camera.lookAt(cube.position);

// Debugging
window.scene = scene;
window.camera = camera;
document.body.innerHTML += `<div id="debugging-stats"></div>`;

// loader.setPath('./src/skybox/ely_peaks/')
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xffffff, 0.15);
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

// Animation Loop
const animate = function () {
	requestAnimationFrame( animate );

	player.update()

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render( scene, camera );
};

animate();