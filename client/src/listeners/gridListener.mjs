import * as THREE from "three";
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

import terrainData from "../terrainData/Grid_Output_Everest_60_1577483271471.json";

// Store Values in IndexedDB

window.addEventListener("populateGridDB", (e) => {
  console.log("[LISTENER] - populateGridDB");
  populateDB(e.detail.callback, e.detail.currentPosition, e.detail.sceneRef);
  //connectTiles(e.detail.currentPosition, e.detail.sceneRef);
});

async function populateDB(callback, currentPosition, sceneRef = false) {
  console.log("populateDB");
  console.log("sceneRef");
  console.log(sceneRef);
  const indexedDB =
      window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB,
    dbs = await indexedDB.databases(),
    dbExists = dbs.map((db) => db.name).includes("terrainJSON");

  if (!indexedDB) {
    alert("You're browser does not support IndexedDB :(");
  } else {
    if (!dbExists) {
      console.log("indexedDB data not loaded");
      const dbStoreReq = indexedDB.open("terrainJSON");

      dbStoreReq.onerror = (e) => {
        console.error("DB Error");
        console.error(e);
      };

      dbStoreReq.onupgradeneeded = (e) => {
        const db = e.target.result;

        db.createObjectStore("grid", {
          autoIncrement: false,
        });
      };

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
            };

            storeReq.onerror = (e) => {
              console.error("storeReq error");
              console.error(e);
            };
          }
        }

        // BOXES
        getInitialGrid(callback, currentPosition, sceneRef);
      };
    } else {
      console.log("indexedDB Data Already Loaded");
      // BOXES
      getInitialGrid(callback, currentPosition, sceneRef);
    }
  }
}

// Get Value from IndexedDB

function getGridDataByKeys(gridKeys, sceneRef = false, callback = false) {
  const dbStoreRead = indexedDB.open("terrainJSON");

  dbStoreRead.onerror = (e) => {
    console.error("DB Error");
    console.error(e);
  };

  dbStoreRead.onsuccess = (e) => {
    const db = e.target.result;

    for (var i = 0; i < gridKeys.length; i++) {
      const gridKey = gridKeys[i],
        transaction = db.transaction(["grid"], "readonly"),
        objectStore = transaction.objectStore("grid"),
        storeReq = objectStore.get(gridKey);

      (function (i) {
        // wrapped to preserve correct state of i val in loop of async
        storeReq.onsuccess = (e) => {
          // Adds 3D planes with read data
          sceneRef.add(createTile(gridKey, e.target.result, sceneRef));
          console.log(`i: ${i}, gridKeysLength: ${gridKeys.length - 1}`);
          console.log(callback);
          console.log(callback !== false);
          console.log(typeof callback === "function");
          if (
            i === gridKeys.length - 1 &&
            callback !== false &&
            typeof callback === "function"
          ) {
            console.log("TILE DATA LOADED");
            callback();
          }
        };

        storeReq.onerror = (e) => {
          console.error("storeReq error");
          console.error(e);
        };
      })(i);
    }
  };
}

// Get All Values from IndexedDB

function getFullGrid() {
  const dbStoreRead = indexedDB.open("terrainJSON");

  dbStoreRead.onerror = (e) => {
    console.error("DB Error");
    console.error(e);
  };

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
    };

    request.onerror = (e) => {
      console.error("storeReq error");
      console.error(e);
    };
  };
}

// Load starting grid

function getInitialGrid(
  callback,
  currentPosition,
  sceneRef = false,
  data = false
) {
  console.log("getInitialGrid");
  console.log("sceneRef");
  console.log(sceneRef);
  // Minimum Starting Coordinate is 1-1
  const latKey = window.currentGrid[1],
    longKey = window.currentGrid[0];
  let gridKeys = [];

  for (var a = latKey - 1; a < latKey + 2; a++) {
    for (var b = longKey - 1; b < longKey + 2; b++) {
      // Creating Grid Boxes - Not Actively Loading Vertex Data into Planes
      if (a >= 0 && b >= 0) {
        // a - latkey, b - longkey
        gridKeys.push(`${a}-${b}`);
        // sceneRef.add(createTile(a, b, data, sceneRef));
      }
    }
  }

  getGridDataByKeys(
    gridKeys,
    sceneRef,
    connectTiles(window.currentGrid, sceneRef)
  );

  // One off for highlighting initial starting position
  setTimeout(function () {
    changeGridColor(`${latKey}-${longKey}`, 0xff0000, false, sceneRef);
  }, 2000);

  // callback from populateGridDB Emitted Event
  // callback();
}

////////////////////////
// GRID CHANGE EVENTS //
////////////////////////

let pastGridCoords = {};

window.addEventListener("gridChange", (e) => {
  console.log("[LISTENER] - gridChange");
  pastGridCoords = storeOldGridCoords(e.detail.oldPosition);
  createTiles(e.detail.newPosition, e.detail.sceneRef, function () {
    changeGridColor(
      `${e.detail.newPosition[0]}-${e.detail.newPosition[1]}`,
      0xff0000,
      false,
      e.detail.sceneRef
    );
    changeGridColor(
      `${e.detail.oldPosition[0]}-${e.detail.oldPosition[1]}`,
      0x0000ff,
      true,
      e.detail.sceneRef
    );
    connectTiles(e.detail.oldPosition, e.detail.sceneRef);
  });
  resetTiles(e.detail.gridVals, e.detail.sceneRef);
  //connectTiles(e.detail.newPosition, e.detail.sceneRef);
  window.currentGrid = e.detail.newPosition;
});

// Store Old Grids

function storeOldGridCoords(gridKeyArr, pastGridCoordObj) {
  console.log("storeOldGridCoords");
  let obj = Object.assign({}, pastGridCoordObj);
  // obj[`${gridKeyArr[1]}-${gridKeyArr[0]}`] = new Date().getTime();
  obj[`${gridKeyArr[0]}-${gridKeyArr[1]}`] = new Date().getTime();
  return obj;
}

// Create Tiles

function createTiles(currentGridArr, sceneRef = false, callback = false) {
  console.log("createGrids");
  const longStart = currentGridArr[0] - 1,
    latStart = currentGridArr[1] - 1,
    gridKeys = [];

  for (var long = longStart; long < longStart + 3; long++) {
    for (var lat = latStart; lat < latStart + 3; lat++) {
      //gridKeys.push(`${lat}-${long}`);
      gridKeys.push(`${long}-${lat}`);
    }
  }

  // Gets data from DB and loops createTile to add to Scene
  getGridDataByKeys(gridKeys, sceneRef, callback);
}

function createTile(gridKey, data, sceneRef) {
  console.log("createTile");
  if (sceneRef) {
    if (!sceneRef.getObjectByName(`${gridKey}`)) {
      // Lat-Long
      const geometry = new THREE.PlaneBufferGeometry(800, 800, 9, 9),
        material = new THREE.MeshBasicMaterial({
          color: 0x0000ff,
          wireframe: true,
          side: THREE.DoubleSide,
        }),
        plane = new THREE.Mesh(geometry, material),
        rotation = (90 * Math.PI) / 180,
        gridKeyArr = gridKey.split("-");
      let vertices = plane.geometry.attributes.position.array;

      console.log(`Tile Created: ${gridKey}`);

      plane.name = `${gridKey}`;
      plane.position.set(
        parseInt(gridKeyArr[1]) * 800 /*Lat*/,
        0,
        parseInt(gridKeyArr[0]) * 800 /*Long*/
      );
      plane.rotateX(rotation);

      // plane.geometry.attributes.position.needsUpdate = true;
      // plane.geometry.attributes.color.needsUpdate = true;

      // Code from another branch - for visualization - not accurate
      // geometry.rotateX( - Math.PI / 2 );

      // console.log("DATA");
      // console.log(data);
      // console.log("VERTICES");
      // console.log(vertices);

      let a = 0,
        b = 0;

      for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        if (a < data.length) {
          //console.log(`vertices[${j}], data[${a}][${b}]`);
          //console.log(vertices[j]);
          vertices[j + 2] -= data[a][b].elevation;
          b++;

          if (b === 10) {
            b = 0;
            a += 1;
          }
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

function resetTiles(gridArr, sceneRef = false) {
  console.log("resetTiles");
  console.log(gridArr);

  for (var i = 0; i < gridArr.length; i++) {
    if (sceneRef.getObjectByName(gridArr[i])) {
      changeGridColor(gridArr[i], 0x649b00, true, sceneRef);
    }
  }

  // for (var i = 0; i < gridArr.length; i++) {
  // 	const tile = sceneRef.getObjectByName(gridArr[i]);
  // 	tile ? tile.remove() : false;
  // }
}

// Connect Tiles Vertices

// IN PROGRESS
function connectTiles(currGridKey, sceneRef) {
  console.log("connectTiles");
  console.log("currGridKey");
  // Current Tile Connection
  for (var lat = 0; lat < currGridKey[0] + 2; lat++) {
    for (var long = 0; long < currGridKey[1] + 2; long++) {
      const currentTile = sceneRef.getObjectByName(`${lat}-${long}`);
      // Current Grid Tile Per Loop
      if (currentTile) {
        const currentTileVerts = currentTile.geometry.attributes.position.array,
          latPlusTile = sceneRef.getObjectByName(`${lat}-${long + 1}`),
          longPlusTile = sceneRef.getObjectByName(`${lat + 1}-${long}`);

        // Connect Latitudinally
        if (latPlusTile) {
          const latPlusTileVerts =
            latPlusTile.geometry.attributes.position.array;
          for (var y = 0; y < currentTileVerts.length; y += 27) {
            const newVertHeight =
              (currentTileVerts[y] + latPlusTileVerts[y]) / 2;
            latPlusTileVerts[y] = newVertHeight;
            currentTileVerts[y] = newVertHeight;
          }
          latPlusTile.geometry.attributes.position.needsUpdate = true;
          currentTile.geometry.attributes.position.needsUpdate = true;
          latPlusTile.geometry.computeBoundingSphere();
          currentTile.geometry.computeBoundingSphere();
        }
        // Connection Longitudinally
        if (longPlusTile) {
          const longPlusTileVerts =
            longPlusTile.geometry.attributes.position.array;
          for (var x = 0; x < currentTileVerts.length; x += 3) {
            const newVertHeight =
              (currentTileVerts[x] + longPlusTileVerts[x]) / 2;
            longPlusTileVerts[x] = newVertHeight;
            currentTileVerts[x] = newVertHeight;
          }
          longPlusTile.geometry.attributes.position.needsUpdate = true;
          currentTile.geometry.attributes.position.needsUpdate = true;
          longPlusTile.geometry.computeBoundingSphere();
          currentTile.geometry.computeBoundingSphere();
        }
      }
    }
  }

  // Corner Tile Connection
}

// Change Current Grid Color

function changeGridColor(
  gridKey,
  hexColor,
  wireframeBoolean,
  sceneRef = false
) {
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
export { storeOldGridCoords, createTile, resetTiles, changeGridColor };