const THREE = require('three');

/////////////////////////
// GRID EVENT LISTENER //
/////////////////////////

/* 
	Handles all grid and coordinate logic.
	1) GRID DB EVENTS - CRUD of coordinate system with IndexedDB/JSON. 
	2) GRID CHANGE EVENTS - Grid reactions to helicopter movements and grid changes. 
*/

function gridListener(){

	console.log("[LISTENER INIT] - gridListener");

	////////////////////
	// GRID DB EVENTS //
	////////////////////

	const terrainData = require('../terrainData/Grid_Output_Everest_60_1577483271471.json');

	// Store Values in IndexedDB 

	window.addEventListener("populateGridDB", (e) => {
		console.log("[LISTENER] - populateGridDB");
		populateDB(e.detail.callback, e.detail.sceneRef);
	});

	function populateDB(callback, sceneRef = false){
		console.log("populateDB");
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
			getInitialGrid(callback, sceneRef);
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

	function getInitialGrid(callback, sceneRef = false){
		console.log("getInitialGrid");
		// Minimum Starting Coordinate is 1-1
		const latKey = window.currentGrid[1],
			  longKey = window.currentGrid[0];

		for (var a = latKey - 1; a < latKey + 2; a++) {
			for (var b = longKey - 1; b < longKey + 2; b++) {
				// Creating Grid Boxes - Not Actively Loading Vertex Data into Planes
				if (a >= 0 && b >= 0){
					createGrid(a, b, sceneRef);
				}
			}
		}

		callback();
	};

	////////////////////////
	// GRID CHANGE EVENTS //
	////////////////////////

	let pastGridCoords = {};

	window.addEventListener("gridChange", (e) => {
		console.log("[LISTENER] - gridChange");
		console.log(e.detail.newPosition);
		storeOldGridCoords(e.detail.oldPosition);
		createGrids(e.detail.newPosition, e.detail.sceneRef);
		resetGrids(e.detail.gridVals, e.detail.sceneRef);
		changeGridColor(e.detail.newPosition, 0xff0000, false, e.detail.sceneRef);
		window.currentGrid = e.detail.newPosition;
	});

	// Store Old Grids

	function storeOldGridCoords(gridKeyArr){
		console.log("storeOldGridCoords");
		pastGridCoords[`${gridKeyArr[0]}-${gridKeyArr[1]}`] = new Date().getTime();
	}

	// Create Grids

	function createGrids(currentGridArr, sceneRef = false){
		console.log("createGrids");
		const longStart = (currentGridArr[0] - 1),
			  latStart = (currentGridArr[1] - 1);

		for (var j = longStart; j < (longStart + 3); j++) {
			for (var k = latStart; k < (latStart + 3); k++) {
				const obj = sceneRef.getObjectByName(`${k}-${j}`);
				if (!obj) {
					createGrid(j, k, sceneRef);
				}
			}
		}
	}

	function createGrid(latKey, longKey, sceneRef = false){
		console.log("createGrid");
		if (sceneRef) {
			const geometry = new THREE.BoxBufferGeometry( 800, 3500, 800 ),
			  	  material = new THREE.MeshBasicMaterial({ wireframe: false, color: 0x0000FF }),
			  	  cube = new THREE.Mesh( geometry, material );

			cube.position.set( (latKey*800), 0, (longKey*800) );
			cube.name = `${latKey}-${longKey}`;

			scene.getObjectByName(`${latKey}-${longKey}`) 
			? console.log(`${latKey}-${longKey} already exists, obj not added.`) 
			: sceneRef.add(cube);
		} else {
			console.error("createGrid missing scene reference");
		}
	}

	// Reset Grids

	function resetGrids(gridArr, sceneRef = false){
		console.log("resetGrids");
		console.log(gridArr);
		for (var i = 0; i < gridArr.length; i++) {
			if (sceneRef.getObjectByName(gridArr[i])) {
				changeGridColor(gridArr[i], 0x649b00, true, sceneRef);
			}
		}
	}

	// Change Current Grid Color

	function changeGridColor(gridKey, hexColor, wireframeBoolean, sceneRef = false){
		console.log("changeGridColor");
		console.log("gridKey");
		console.log(gridKey);
		const obj = sceneRef.getObjectByName(gridKey);
		if (obj) {
			obj.material.color.setHex(hexColor);
			obj.material.wireframe = wireframeBoolean;
		}
	}

}

module.exports = gridListener;