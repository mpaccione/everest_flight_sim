/////////////////////////
// GRID EVENT LISTENER //
/////////////////////////

/* 
	Handles all grid and coordinate logic.
	1) GRID DB EVENTS - CRUD of coordinate system with IndexedDB/JSON. 
	2) GRID CHANGE EVENTS - Grid reactions to helicopter movements and grid changes. 
*/

////////////////////
// GRID DB EVENTS //
////////////////////

const terrainData = require('./src/terrainData/Grid_Output_Everest_60_1577483271471.json');

// Store Values in IndexedDB 

window.addEventListener("populateGridDB", (e) => {
	populateDB(e.sceneRef)
});

function populateDB(){

	const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB,
		  dbStoreReq = indexedDB.open("terrainJSON");

	if (!indexedDB) {
		alert("You're browser does not support IndexedDB :(");
	}

	dbStoreReq.onerror = (e) => {
		console.error("DB Error");
		console.error(e);
	}

	dbStoreReq.onupgradeneeded = (e) => {
		const db = e.target.result;

		db.createObjectStore("grid", {
			autoIncrement: false
		})
	}

	dbStoreReq.onsuccess = (e) => {
		const db = e.target.result,
			  transaction = db.transaction(["grid"], "readwrite"),
			  store = transaction.objectStore("grid");

		for (var j = 0; j < terrainData.length; j++) {
			const gridTile = terrainData[j];
			for (var k = 0; k < gridTile.length; k++) {
				const subGridTile = gridTile[k],
					  storeReq = store.add(subGridTile, `${k}-${j}`);

				storeReq.onsuccess = (e) => {
					console.log("storeReq success");
				}

				storeReq.onerror = (e) => {
					console.error("storeReq error");
					console.error(e);
				}
			}
		}

		// BOXES
		getInitialGrid();
	}

}

// Get Value from IndexedDB

function getGridByKeyArr(gridKeyArr){
	const dbStoreRead = indexedDB.open("terrainJSON");

	dbStoreRead.onerror = (e) => {
		console.error("DB Error");
		console.error(e);
	}

	dbStoreRead.onsuccess = (e) => {
		const db = e.target.result,
			  objectStore = db.transaction(["grid"], "readonly"),
			  storeReq = objectStore.get(gridKey);

		for (var i = 0; i < gridKeyArr.length; i++) {
			const gridKey = gridKeyArr[i];

			objectStore.get(gridKey).onsuccess = (e) => {
				console.log(`storeReq success: ${gridKeyArr[i]}`);
				res = e.target.result;
			}

			objectStore.get(gridKey).onerror = (e) => {
				console.error("storeReq error");
				console.error(e);
			}

		}
	}
}

// Get All Values from IndexedDB

function getFullGrid(){
	const dbStoreRead = indexedDB.open("terrainJSON");

	dbStoreRead.onerror = (e) => {
		console.error("DB Error");
		console.error(e);
	}

	dbStoreRead.onsuccess = (e) => {
		const db = e.target.result,
			  transaction = db.transaction(["grid"], "readonly"),
			  objectStore = transaction.objectStore("grid"),
			  request = objectStore.openCursor();

		request.onsuccess = (e) => {
			const cursor = e.target.result;
			if (cursor) {
				// Only Logs Values Currently
				console.log(cursor);
				cursor.continue();
			} else {
				console.log("No More Entries!");
			}
		}

		request.onerror = (e) => {
			console.error("storeReq error");
			console.error(e);
		}
	}

}

// Load starting grid 

function getInitialGrid(sceneRef = false){
	// Minimum Starting Coordinate is 1-1
	const latKey = window.currentGrid.charAt(0),
		  longKey = window.currentGrid.charAt(2);

	for (var a = latKey - 1; a < latKey + 1; a++) {
		for (var b = longKey - 1; b < longKey + 1; b++) {
			// Creating Grid Boxes - Not Actively Loading Vertex Data into Planes
			if (a >= 0 && b >= 0){
				createGrid(a, b, sceneRef);
			}
		}
	}

	// Adjusting Camera To Look At Current Grid
	camera.lookAt(scene.getObjectByName(window.currentGrid).position);
	controls.update();
	camera.lookAt(scene.getObjectByName(window.currentGrid).position);
};

////////////////////////
// GRID CHANGE EVENTS //
////////////////////////

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

function createGrids(currentGridArr, sceneRef = false){
	const longStart = (currentGridArr[0] - 1),
		  latStart = (currentGridArr[1] - 1);

	for (var j = longStart; j < (longStart + 3); j++) {
		for (var k = latStart; k < (latStart + 3); k++) {
			const obj = e.sceneRef.getObjectByName(`${k}-${j}`);
			if (!obj) {
				createGrid(j, k, sceneRef);
			}
		}
	}
}

function createGrid(latKey, longKey, sceneRef = false){
	const geometry = new THREE.BoxBufferGeometry( 800, 3500, 800 ),
	  	  material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0000FF }),
	  	  cube = new THREE.Mesh( geometry, material );

	cube.position.set( (latKey*800), 0, (longKey*800) );
	cube.name = `${latKey}-${longKey}`;

	sceneRef ? sceneRef.add(cube) : console.error("createGrid missing scene reference");
}

// Reset Grids

function resetGrids(gridArr){
	console.log("resetGrids - gridArr");
	console.log(gridArr);
	for (var i = 0; i < gridArr.length; i++) {
		if (e.sceneRef.getObjectByName(gridArr[i])) {
			changeGridColor(gridArr[i], 0x649b00, true);
		}
	}
}

// Change Current Grid Color

function changeGridColor(gridKey, hexColor, wireframeBoolean){
	console.log("changeGridColor - gridKey");
	console.log(gridKey);
	console.log(`${gridKey[0]}-${gridKey[1]}`);
	const obj = e.sceneRef.getObjectByName(`${gridKey[0]}-${gridKey[1]}`);
	if (obj) {
		obj.material.color.setHex(hexColor);
		obj.material.wireframe = wireframeBoolean;
	}
}