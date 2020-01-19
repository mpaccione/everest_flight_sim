///////////////////////
//GRID EVENT LISTENER//
///////////////////////
let pastGridCoords = {};

window.addEventListener("gridChange", (e) => {
	storeOldGridCoords(e.oldPosition);
	createGrids(e.newPosition);
	resetGrids(e.gridVals);
	changeGridColor(e.newPosition, 0xff0000, false);
});

// Store Old Grids

function storeOldGridCoords(gridKeyArr){
	pastGridCoords[`${gridKeyArr[0]}-${gridKeyArr[1]}`] = new Date().getTime();
}

// Create Grids

function createGrids(currentGridArr){
	const longStart = (currentGridArr[0] - 1),
		  latStart = (currentGridArr[1] - 1);

	for (var j = longStart; j < (longStart + 3); j++) {
		for (var k = latStart; k < (latStart + 3); k++) {
			const obj = scene.getObjectByName(`${k}-${j}`);
			if (!obj) {
				createGrid(j, k);
			}
		}
	}
}

function createGrid(latKey, longKey){
	const geometry = new THREE.BoxBufferGeometry( 800, 3500, 800 ),
	  	  material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0000FF }),
	  	  cube = new THREE.Mesh( geometry, material );

	cube.position.set( (latKey*800), 0, (longKey*800) );
	cube.name = `${latKey}-${longKey}`;

	scene.add(cube);
}

// Reset Grids

function resetGrids(gridArr){
	console.log("resetGrids - gridArr");
	console.log(gridArr);
	for (var i = 0; i < gridArr.length; i++) {
		if (scene.getObjectByName(gridArr[i])) {
			changeGridColor(gridArr[i], 0x649b00, true);
		}
	}
}

// Change Current Grid Color

function changeGridColor(gridKey, hexColor, wireframeBoolean){
	console.log("changeGridColor - gridKey");
	console.log(gridKey);
	console.log(`${gridKey[0]}-${gridKey[1]}`);
	const obj = scene.getObjectByName(`${gridKey[0]}-${gridKey[1]}`);
	if (obj) {
		obj.material.color.setHex(hexColor);
		obj.material.wireframe = wireframeBoolean;
	}
}