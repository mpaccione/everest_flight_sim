const THREE = require('three');

/////////////////////////
// GRID EVENT LISTENER //
/////////////////////////

/* 
	Handles all grid and coordinate logic.
	1) GRID DB EVENTS - CRUD of coordinate system with IndexedDB/JSON. 
	2) GRID CHANGE EVENTS - Grid reactions to helicopter movements and grid changes. 
*/

console.log("[LISTENER INIT] - gridListener");

////////////////////
// GRID DB EVENTS //
////////////////////

const terrainData = require('../terrainData/Grid_Output_Everest_60_1577483271471.json');

// Store Values in IndexedDB 

window.addEventListener("populateGridDB", (e) => {
	console.log("[LISTENER] - populateGridDB");
	populateDB(e.detail.callback, e.detail.currentPosition, e.detail.sceneRef);
});

async function populateDB(callback, currentPosition, sceneRef = false){
	console.log("populateDB");
	const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB,
		  dbs = await indexedDB.databases(),
		  dbExists = dbs.map(db => db.name).includes("terrainJSON"); 

	if (!indexedDB) {
		alert("You're browser does not support IndexedDB :(");
	} else {

		if (!dbExists) {
			console.log("indexedDB data not loaded");
			const dbStoreReq = indexedDB.open("terrainJSON");

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

				getInitialGrid(callback, currentPosition, sceneRef);
			}

		} else {
			// BOXES
			getInitialGrid(callback, currentPosition, sceneRef);
		}

	}

}

// Get Value from IndexedDB

function getGridByKeyArr(gridKeys, sceneRef = false){
	const dbStoreRead = indexedDB.open("terrainJSON"),
		  res = new Array(gridKeys.length);

	console.log("getGridByKeyArr");
	console.log(gridKeys);

	dbStoreRead.onerror = (e) => {
		console.error("DB Error");
		console.error(e);
	}

	dbStoreRead.onsuccess = (e) => {
		const db = e.target.result;
		for (var i = 0; i < gridKeys.length; i++) {
			const objectStore = db.transaction(["grid"], "readonly"),
				  storeReq = objectStore.get(gridKeys[i]);

			console.log(`dbStoreRead Success, gridKey[${i}]`);

			objectStore.get(gridKeys[i]).onsuccess = (e) => {
				console.log(`storeReq success: ${gridKeyArr[i]}`);
				// Adds 3D planes with read data
				sceneRef.add(createTile(gridKeys[i], e.target.result, sceneRef));
			}

			objectStore.get(gridKeys[i]).onerror = (e) => {
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

function getInitialGrid(callback, currentPosition, data = false, sceneRef = false){
	console.log("getInitialGrid");
	// Minimum Starting Coordinate is 1-1
	const latKey = window.currentGrid[1],
		  longKey = window.currentGrid[0];
	let   gridKeys = [];

	for (var a = latKey - 1; a < latKey + 2; a++) {
		for (var b = longKey - 1; b < longKey + 2; b++) {
			// Creating Grid Boxes - Not Actively Loading Vertex Data into Planes
			if (a >= 0 && b >= 0){
				// a - latkey, b - longkey
				gridKeys.push([b, a]);
				// sceneRef.add(createTile(a, b, data, sceneRef));
			}
		}
	}

	console.log(gridKeys);

	getGridByKeyArr(gridKeys, sceneRef);
	// callback from populateGridDB Emitted Event
	// callback();
	// changeGridColor(`${currentPosition[0]}-${currentPosition[1]}`, 0xFF0000, false, sceneRef);
};

////////////////////////
// GRID CHANGE EVENTS //
////////////////////////

let pastGridCoords = {};

window.addEventListener("gridChange", (e) => {
	console.log("[LISTENER] - gridChange");

	pastGridCoords = storeOldGridCoords(e.detail.oldPosition);
	createTiles(e.detail.newPosition, e.detail.sceneRef);
	resetTiles(e.detail.gridVals, e.detail.sceneRef);
	//changeGridColor(`${e.detail.newPosition[0]}-${e.detail.newPosition[1]}`, 0xff0000, false, e.detail.sceneRef);
	window.currentGrid = e.detail.newPosition;
});

// Store Old Grids

function storeOldGridCoords(gridKeyArr, pastGridCoordObj){
	console.log("storeOldGridCoords");
	let obj = Object.assign({}, pastGridCoordObj);
	obj[`${gridKeyArr[0]}-${gridKeyArr[1]}`] = new Date().getTime();
	return obj;
}

// Create Tiles

function createTiles(currentGridArr, sceneRef = false){
	console.log("createGrids");
	const longStart = (currentGridArr[0] - 1),
		  latStart = (currentGridArr[1] - 1),
		  gridKeyArr = [];

	for (var j = longStart; j < (longStart + 3); j++) {
		for (var k = latStart; k < (latStart + 3); k++) {
			gridKeyArr.push(`${k}-${j}`);
		}
	}

	// Gets data from DB and loops createTile to add to Scene
	getGridByKeyArr(gridKeyArr);
}

function createTile(gridKey, data, sceneRef){
	console.log("createTile");
	if (sceneRef) {
		if (!sceneRef.getObjectByName(`${gridKey[1]}-${gridKey[0]}`)) { // Lat-Long
			const geometry = new THREE.PlaneBufferGeometry( 800, 10, 10, 10 ),
				  material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} ),
				  plane = new THREE.Mesh( geometry, material );
			let   vertices = plane.geometry.attributes.position.array;

			plane.name = `${gridKey[1]}-${gridKey[0]}`;
			// plane.geometry.attributes.position.needsUpdate = true;
			// plane.geometry.attributes.color.needsUpdate = true;

			// Code from another branch - for visualization - not accurate 
			// geometry.rotateX( - Math.PI / 2 );

			// for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
			// 	vertices[ j + 1 ] = this.data[ i ];
			// }

			for (var a = 0; a < data; a++) {
				for (var b = 0; b < data[a].length; b++) {
					data[a][b] = vertices[a+b]; 
				}
			}

			return plane;
		}
	}
}

// function createGrid(latKey, longKey, sceneRef = false){
// 	console.log("createGrid");
// 	if (sceneRef) {
// 		if (sceneRef.getObjectByName(`${latKey}-${longKey}`)) {
// 			changeGridColor(`${latKey}-${longKey}`, 0x0000FF, false, sceneRef); 
// 		} else {
// 			const geometry = new THREE.BoxBufferGeometry( 800, 3500, 800 ),
// 			  	  material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0000FF }),
// 			  	  cube = new THREE.Mesh( geometry, material );

// 			cube.position.set( (latKey*800), 0, (longKey*800) );
// 			cube.name = `${latKey}-${longKey}`;
			
// 			return cube;
// 		}
// 	} else {
// 		console.error("createGrid missing scene reference");
// 	}
// }

// Reset Grids

function resetTiles(gridArr, sceneRef = false){
	console.log("resetTiles");
	for (var i = 0; i < gridArr.length; i++) {
		const tile = sceneRef.getObjectByName(gridArr[i]);
		tile ? tile.remove() : false;
	}
}

// Change Current Grid Color

function changeGridColor(gridKey, hexColor, wireframeBoolean, sceneRef = false){
	console.log("changeGridColor");
	const obj = sceneRef.getObjectByName(gridKey);
	if (obj) {
		obj.material.color.setHex(hexColor);
		obj.material.wireframe = wireframeBoolean;
		return true;
	} else {
		console.error(`changeGridColor error, ${gridKey} object not found`);
		return false;
	}
}

// Exports for Testing
module.exports = {
	storeOldGridCoords,
	createTile,
	resetTiles,
	changeGridColor
}