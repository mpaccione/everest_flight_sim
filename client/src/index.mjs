// Imports
//import Helicopter from "./classes/helicopter.mjs";
// import gridListener from "./listeners/gridListener.mjs";
// import OrbitControls from "three-orbit-controls";
import { Threebox } from "threebox-plugin/dist/threebox.js";
import config from "./config.js";
import mapboxgl from "mapbox-gl";
import "./styles.css";

console.log("[APP INIT]");

////////////////////
///// RUNTIME /////
///////////////////

// Mapbox
mapboxgl.accessToken = config.accessToken;

var map = new mapboxgl.Map({
  container: "threeCanvas", // container id
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});

// const map = new mapboxgl.Map({
//   container: "threeCanvas", // Container ID
//   style: "mapbox://styles/mapbox/satellite-v9", // Style URL
//   center: [27.6857, 86.7278], // Starting Pos LNG/LAT
//   zoom: 9, // Starting Zoom
// });

// function animate() {
//   requestAnimationFrame(animate);
// }

// map.on("style.load", function () {
//   animate();

//   map.addLayer({
//     id: "custom_layer",
//     type: "custom",
//     renderingMode: "3d",
//     onAdd: function (map, mbxContext) {
//       console.log({ map });
//       console.log({ mbxContext });
//       console.log({ Threebox });
//       // instantiate threebox
//       window.tb = new Threebox(map, mbxContext, { defaultLights: true });

//       //instantiate a red sphere and position it at the origin lnglat
//       const sphere = window.tb
//         .sphere({
//           color: "red",
//           material: "MeshToonMaterial",
//         })
//         .setCoords(origin);
//       //add sphere to the scene
//       window.tb.add(sphere);
//     },

//     render: function (gl, matrix) {
//       window.tb.update();
//       console.log("render");
//     },
//   });
// });
