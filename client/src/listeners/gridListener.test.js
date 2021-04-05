const THREE = require('three');
const { 
	// Grid Init Functions
	//
	// Grid Change Functions
	storeOldGridCoords, 
	createGrid, 
	resetGrids, 
	changeGridColor 
} = require("./gridListener");

// storeOldGridCoords
/////////////////////
// input: gridKeyArr
// output: object with grid keys and timestamp value
test('gridKeyArr input: [1,1], should output: {} with 1-1 key and date timestamp value', () => {
	const gridKeyArr = [1,1],
		  pastGridCoordsObj = {};

	expect(Number.isInteger(storeOldGridCoords(gridKeyArr, pastGridCoordsObj)[`${gridKeyArr[0]}-${gridKeyArr[1]}`])).toBe(true);
})

// createGrid
/////////////
// input: latKey, longKey
// output: 3D Cube Object
test('createGrid input: latKey, longKey integers, should output Three.js Cube Object', () => {
	const latKey = 1,
		  longKey = 1,
		  sceneRef = new THREE.Scene();

	expect(typeof createGrid(latKey, longKey, sceneRef)).toBe('object');
})

// changeGridColor
//////////////////
// input: gridKey, hexColor, wireframeBoolean, sceneRef
// output: boolean, true for success, false for error finding object.
test('changeGridColor input: gridKey, hexColor, wireframeBoolean, sceneRef, should output truthy boolean if object exists', () => {
	const gridKey = '1-1',
		  hexColor = 0xFF0000,
		  wireframeBoolean = false,
		  sceneRef = new THREE.Scene();

	// Mock Scene
	const geometry = new THREE.BoxBufferGeometry( 800, 3500, 800 ),
	  	  material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0000FF }),
	  	  cube = new THREE.Mesh( geometry, material );

	cube.name = gridKey;
	sceneRef.add(cube);

	expect(typeof gridKey).toBe('string');
	expect(Number.isInteger(hexColor)).toBe(true);
	expect(changeGridColor(gridKey, hexColor, wireframeBoolean, sceneRef));
})