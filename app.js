// Imports
const THREE = require('three');
const GLTFLoader = require('three-gltf-loader');
const Helicopter = require('./src/classes/helicopter');

// View
const scene = new THREE.Scene(),
	  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000000 ),
	  // camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 1000000 ),
	  renderer = new THREE.WebGLRenderer();

// Group
const miniHeliGroup = new THREE.Group();

// Load Helicopter Model
const miniModelLoader = new GLTFLoader();

miniModelLoader.load( './src/models/helicopter/scene.gltf', function(gltf){
	miniModel = gltf.scene;
	miniModel.name = "miniHeli"
	miniModel.rotation.y = -90 * Math.PI / 180; // Radians
    miniModel.position.set( 0, 0, 0 );

    let miniModelMesh = miniModel.children[0].children[0].children[0],
    	miniModelMeshArr = [ miniModelMesh.children[0], miniModelMesh.children[1], miniModelMesh.children[2] ];

    for (var i = miniModelMeshArr.length - 1; i >= 0; i--) {
    	miniModelMeshArr[i].material.wireframe = true;
    }

    miniHeliGroup.add( new THREE.AxesHelper(500) )
	miniHeliGroup.add( miniModel );
	scene.add(miniHeliGroup);
} )

// Initiate Helicopter
const player = new Helicopter(miniHeliGroup, "Wireframe", 14000);

// Grid for Reference
const gridSize = 10000,
	  gridDivisions = 40,
	  gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

scene.add(gridHelper);

// Camera
camera.name = "camera";
camera.position.z = 6000;
camera.position.y = 6000;
// camera.position.x = 1500;
camera.lookAt(miniHeliGroup.position);

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