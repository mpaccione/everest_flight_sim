// Imports
import THREE from "three";
import GLTFLoader from "three-gltf-loader";
import Helicopter from "./classes/helicopter";
import gridListener from "./listeners/gridListener";
import OrbitControls from "three-orbit-controls";
import { Threebox } from "threebox-plugin/dist/threebox";
import { config } from "./config.js";
import MapboxGL from "mapbox-gl";

console.log("[APP INIT]");

// gridListener();

////////////////////////////////
///// THREE BUFFER UTILITY /////
////////////////////////////////

const BufferGeometryUtils = {
  computeTangents: function (geometry) {
    var index = geometry.index;
    var attributes = geometry.attributes;

    // based on http://www.terathon.com/code/tangent.html
    // (per vertex tangents)

    if (
      index === null ||
      attributes.position === undefined ||
      attributes.normal === undefined ||
      attributes.uv === undefined
    ) {
      console.warn(
        "THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()"
      );
      return;
    }

    var indices = index.array;
    var positions = attributes.position.array;
    var normals = attributes.normal.array;
    var uvs = attributes.uv.array;

    var nVertices = positions.length / 3;

    if (attributes.tangent === undefined) {
      geometry.addAttribute(
        "tangent",
        new THREE.BufferAttribute(new Float32Array(4 * nVertices), 4)
      );
    }

    var tangents = attributes.tangent.array;

    var tan1 = [],
      tan2 = [];

    for (var i = 0; i < nVertices; i++) {
      tan1[i] = new THREE.Vector3();
      tan2[i] = new THREE.Vector3();
    }

    var vA = new THREE.Vector3(),
      vB = new THREE.Vector3(),
      vC = new THREE.Vector3(),
      uvA = new THREE.Vector2(),
      uvB = new THREE.Vector2(),
      uvC = new THREE.Vector2(),
      sdir = new THREE.Vector3(),
      tdir = new THREE.Vector3();

    function handleTriangle(a, b, c) {
      vA.fromArray(positions, a * 3);
      vB.fromArray(positions, b * 3);
      vC.fromArray(positions, c * 3);

      uvA.fromArray(uvs, a * 2);
      uvB.fromArray(uvs, b * 2);
      uvC.fromArray(uvs, c * 2);

      var x1 = vB.x - vA.x;
      var x2 = vC.x - vA.x;

      var y1 = vB.y - vA.y;
      var y2 = vC.y - vA.y;

      var z1 = vB.z - vA.z;
      var z2 = vC.z - vA.z;

      var s1 = uvB.x - uvA.x;
      var s2 = uvC.x - uvA.x;

      var t1 = uvB.y - uvA.y;
      var t2 = uvC.y - uvA.y;

      var r = 1.0 / (s1 * t2 - s2 * t1);

      sdir.set(
        (t2 * x1 - t1 * x2) * r,
        (t2 * y1 - t1 * y2) * r,
        (t2 * z1 - t1 * z2) * r
      );

      tdir.set(
        (s1 * x2 - s2 * x1) * r,
        (s1 * y2 - s2 * y1) * r,
        (s1 * z2 - s2 * z1) * r
      );

      tan1[a].add(sdir);
      tan1[b].add(sdir);
      tan1[c].add(sdir);

      tan2[a].add(tdir);
      tan2[b].add(tdir);
      tan2[c].add(tdir);
    }

    var groups = geometry.groups;

    if (groups.length === 0) {
      groups = [
        {
          start: 0,
          count: indices.length,
        },
      ];
    }

    for (var i = 0, il = groups.length; i < il; ++i) {
      var group = groups[i];

      var start = group.start;
      var count = group.count;

      for (var j = start, jl = start + count; j < jl; j += 3) {
        handleTriangle(indices[j + 0], indices[j + 1], indices[j + 2]);
      }
    }

    var tmp = new THREE.Vector3(),
      tmp2 = new THREE.Vector3();
    var n = new THREE.Vector3(),
      n2 = new THREE.Vector3();
    var w, t, test;

    function handleVertex(v) {
      n.fromArray(normals, v * 3);
      n2.copy(n);

      t = tan1[v];

      // Gram-Schmidt orthogonalize

      tmp.copy(t);
      tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

      // Calculate handedness

      tmp2.crossVectors(n2, t);
      test = tmp2.dot(tan2[v]);
      w = test < 0.0 ? -1.0 : 1.0;

      tangents[v * 4] = tmp.x;
      tangents[v * 4 + 1] = tmp.y;
      tangents[v * 4 + 2] = tmp.z;
      tangents[v * 4 + 3] = w;
    }

    for (var i = 0, il = groups.length; i < il; ++i) {
      var group = groups[i];

      var start = group.start;
      var count = group.count;

      for (var j = start, jl = start + count; j < jl; j += 3) {
        handleVertex(indices[j + 0]);
        handleVertex(indices[j + 1]);
        handleVertex(indices[j + 2]);
      }
    }
  },

  /**
   * @param  {Array<BufferGeometry>} geometries
   * @param  {Boolean} useGroups
   * @return {BufferGeometry}
   */
  mergeBufferGeometries: function (geometries, useGroups) {
    var isIndexed = geometries[0].index !== null;

    var attributesUsed = new Set(Object.keys(geometries[0].attributes));
    var morphAttributesUsed = new Set(
      Object.keys(geometries[0].morphAttributes)
    );

    var attributes = {};
    var morphAttributes = {};

    var mergedGeometry = new THREE.BufferGeometry();

    var offset = 0;

    for (var i = 0; i < geometries.length; ++i) {
      var geometry = geometries[i];

      // ensure that all geometries are indexed, or none

      if (isIndexed !== (geometry.index !== null)) return null;

      // gather attributes, exit early if they're different

      for (var name in geometry.attributes) {
        if (!attributesUsed.has(name)) return null;

        if (attributes[name] === undefined) attributes[name] = [];

        attributes[name].push(geometry.attributes[name]);
      }

      // gather morph attributes, exit early if they're different

      for (var name in geometry.morphAttributes) {
        if (!morphAttributesUsed.has(name)) return null;

        if (morphAttributes[name] === undefined) morphAttributes[name] = [];

        morphAttributes[name].push(geometry.morphAttributes[name]);
      }

      // gather .userData

      mergedGeometry.userData.mergedUserData =
        mergedGeometry.userData.mergedUserData || [];
      mergedGeometry.userData.mergedUserData.push(geometry.userData);

      if (useGroups) {
        var count;

        if (isIndexed) {
          count = geometry.index.count;
        } else if (geometry.attributes.position !== undefined) {
          count = geometry.attributes.position.count;
        } else {
          return null;
        }

        mergedGeometry.addGroup(offset, count, i);

        offset += count;
      }
    }

    // merge indices

    if (isIndexed) {
      var indexOffset = 0;
      var mergedIndex = [];

      for (var i = 0; i < geometries.length; ++i) {
        var index = geometries[i].index;

        for (var j = 0; j < index.count; ++j) {
          mergedIndex.push(index.getX(j) + indexOffset);
        }

        indexOffset += geometries[i].attributes.position.count;
      }

      mergedGeometry.setIndex(mergedIndex);
    }

    // merge attributes

    for (var name in attributes) {
      var mergedAttribute = this.mergeBufferAttributes(attributes[name]);

      if (!mergedAttribute) return null;

      mergedGeometry.addAttribute(name, mergedAttribute);
    }

    // merge morph attributes

    for (var name in morphAttributes) {
      var numMorphTargets = morphAttributes[name][0].length;

      if (numMorphTargets === 0) break;

      mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
      mergedGeometry.morphAttributes[name] = [];

      for (var i = 0; i < numMorphTargets; ++i) {
        var morphAttributesToMerge = [];

        for (var j = 0; j < morphAttributes[name].length; ++j) {
          morphAttributesToMerge.push(morphAttributes[name][j][i]);
        }

        var mergedMorphAttribute = this.mergeBufferAttributes(
          morphAttributesToMerge
        );

        if (!mergedMorphAttribute) return null;

        mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
      }
    }

    return mergedGeometry;
  },

  /**
   * @param {Array<BufferAttribute>} attributes
   * @return {BufferAttribute}
   */
  mergeBufferAttributes: function (attributes) {
    var TypedArray;
    var itemSize;
    var normalized;
    var arrayLength = 0;

    for (var i = 0; i < attributes.length; ++i) {
      var attribute = attributes[i];

      if (attribute.isInterleavedBufferAttribute) return null;

      if (TypedArray === undefined) TypedArray = attribute.array.constructor;
      if (TypedArray !== attribute.array.constructor) return null;

      if (itemSize === undefined) itemSize = attribute.itemSize;
      if (itemSize !== attribute.itemSize) return null;

      if (normalized === undefined) normalized = attribute.normalized;
      if (normalized !== attribute.normalized) return null;

      arrayLength += attribute.array.length;
    }

    var array = new TypedArray(arrayLength);
    var offset = 0;

    for (var i = 0; i < attributes.length; ++i) {
      array.set(attributes[i].array, offset);

      offset += attributes[i].array.length;
    }

    return new THREE.BufferAttribute(array, itemSize, normalized);
  },
};

////////////////////
///// RUNTIME /////
///////////////////

// Mapbox
MapboxGL.accessToken = config.accessToken;

const map = new MapboxGL.Map({
  container: "map", // Container ID
  style: "mapbox://styles/mapbox/satellite-v9", // Style URL
  center: [27.6857, 86.7278], // Starting Pos LNG/LAT
  zoom: 9, // Starting Zoom
});

function animate() {
  requestAnimationFrame(animate);
  stats.update();
}

map.on("style.load", function () {
  animate();

  map.addLayer({
    id: "custom_layer",
    type: "custom",
    renderingMode: "3d",
    onAdd: function (map, mbxContext) {
      // instantiate threebox
      window.tb = new Threebox(map, mbxContext, { defaultLights: true });

      //instantiate a red sphere and position it at the origin lnglat
      const sphere = tb
        .sphere({ color: "red", material: "MeshToonMaterial" })
        .setCoords(origin);
      // add sphere to the scene
      tb.add(sphere);
    },

    render: function (gl, matrix) {
      tb.update();
    },
  });
});

/*
// View
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000000
  );
const renderer = new THREE.WebGLRenderer(),
const controls = new OrbitControls(camera);

controls.keys = false;

// Group
const miniHeliGroup = new THREE.Group();

// Load Helicopter Model
const miniModelLoader = new GLTFLoader();

miniModelLoader.load("./src/models/helicopter/scene.gltf", function (gltf) {
  miniModel = gltf.scene;
  miniModel.name = "miniHeli";
  miniModel.rotation.y = (-90 * Math.PI) / 180; // Radians

  let miniModelMesh = miniModel.children[0].children[0].children[0],
    miniModelMeshArr = [
      miniModelMesh.children[0],
      miniModelMesh.children[1],
      miniModelMesh.children[2],
    ];

  for (var i = miniModelMeshArr.length - 1; i >= 0; i--) {
    miniModelMeshArr[i].name = "mesh" + i;
    miniModelMeshArr[i].material.wireframe = true;
  }

  miniHeliGroup.add(new THREE.AxesHelper(500));
  miniHeliGroup.add(miniModel);
  miniHeliGroup.position.set(0, 6000, 0);
  scene.add(miniHeliGroup);
});

// Initiate
const player = new Helicopter(miniHeliGroup, "Wireframe", 14000);

// Grid for Reference
// Axes Helper X: Red, Y: Green, Z: Blue
const axesHelper = new THREE.AxesHelper(8000),
  gridSize = 600 * 800,
  gridDivisions = 600,
  gridHelper = new THREE.GridHelper(gridSize, gridDivisions),
  gridArr = [];

gridHelper.position.set(300 * 800 - 400, -1750, 300 * 800 - 400);

scene.add(axesHelper);
scene.add(gridHelper);

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement,
    width = canvas.clientWidth,
    height = canvas.clientHeight,
    needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}

// Quick and Dirty Global
window.currentGrid = [1, 1];

// Init Grid
window.dispatchEvent(
  new CustomEvent("populateGridDB", {
    bubbles: true,
    detail: {
      currentPosition: window.currentGrid,
      sceneRef: scene,
      callback: function () {
        // Adjusting Camera To Look At Current Grid
        console.log("populateDB callback");
        camera.lookAt(
          scene.getObjectByName(
            `${window.currentGrid[0]}-${window.currentGrid[1]}`
          ).position
        );
        controls.update();
        camera.lookAt(
          scene.getObjectByName(
            `${window.currentGrid[0]}-${window.currentGrid[1]}`
          ).position
        );
      },
    },
  })
);

setInterval(function gridCheck() {
  console.log("gridCheck");

  const gridSize = 800,
    latGrid = window.currentGrid[0],
    longGrid = window.currentGrid[1];
  let latMinus = latGrid - 1,
    latPlus = latGrid + 1,
    longMinus = longGrid - 1,
    longPlus = longGrid + 1,
    newPosition = [latGrid, longGrid],
    gridVals = [],
    gridChange = false;

  // Latitude Change
  if (window.flightSim.z > latGrid * gridSize + gridSize) {
    console.log("GRID CHANGE - LAT++");
    console.log(
      `z: ${window.flightSim.z} > (${latGrid} * ${gridSize}) - ${gridSize}`
    );
    // Increase
    gridVals.push(
      `${latMinus}-${longMinus}`,
      `${latMinus}-${longGrid}`,
      `${latMinus}-${longPlus}`
    );
    newPosition[0] = latPlus;
    gridChange = true;
  } else if (window.flightSim.z < latGrid * gridSize - gridSize) {
    console.log("GRID CHANGE - LAT--");
    console.log(
      `z: ${window.flightSim.z} < (${latGrid} * ${gridSize}) - ${gridSize}`
    );
    // Decrease
    gridVals.push(
      `${latPlus}-${longMinus}`,
      `${latPlus}-${longGrid}`,
      `${latPlus}-${longPlus}`
    );
    newPosition[0] = latMinus > 0 ? latMinus : 0;
    gridChange = true;
  }

  // Longitude Change
  if (window.flightSim.x > longGrid * gridSize + gridSize) {
    console.log("GRID CHANGE - LONG++");
    console.log(
      `x: ${window.flightSim.x} > (${longGrid} * ${gridSize}) - ${gridSize}`
    );
    // Increase
    gridVals.push(
      `${latMinus}-${longMinus}`,
      `${latGrid}-${longMinus}`,
      `${latPlus}-${longMinus}`
    );
    newPosition[1] = longPlus;
    gridChange = true;
  } else if (window.flightSim.x < longGrid * gridSize - gridSize) {
    console.log("GRID CHANGE - LONG--");
    console.log(
      `x: ${window.flightSim.x} < (${longGrid} * ${gridSize}) - ${gridSize}`
    );
    // Decrease
    gridVals.push(
      `${latMinus}-${longPlus}`,
      `${latGrid}-${longPlus}`,
      `${latPlus}-${longPlus}`
    );
    newPosition[1] = longMinus > 0 ? longMinus : 0;
    gridChange = true;
  }

  if (gridChange === true) {
    window.dispatchEvent(
      new CustomEvent("gridChange", {
        bubbles: true,
        detail: {
          gridVals,
          oldPosition: currentGrid,
          newPosition: newPosition,
          sceneRef: scene,
        },
      })
    );
  }
}, 2000);

// Camera
camera.name = "camera";
camera.position.x = 38790;
camera.position.y = 43700;
camera.position.z = 14710;

// Debugging
window.scene = scene;
window.camera = camera;
window.controls = controls;
document.body.innerHTML += `<div id="debugging-stats"></div>`;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

// Animation Loop
const animate = function () {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  requestAnimationFrame(animate);
  player.update();
  renderer.render(scene, camera);
};

animate();
*/
