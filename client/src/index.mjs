// Imports
//import Helicopter from "./classes/helicopter.mjs";
// import gridListener from "./listeners/gridListener.mjs";
// import OrbitControls from "three-orbit-controls";
import { Threebox } from "threebox-plugin";
import config from "./config.js";
import MapboxGL from "mapbox-gl";

console.log("[APP INIT]");

////////////////////
///// RUNTIME /////
///////////////////

// Mapbox
MapboxGL.accessToken = config.accessToken;

const map = new MapboxGL.Map({
  container: "threeCanvas", // Container ID
  style: "mapbox://styles/mapbox/satellite-v9", // Style URL
  center: [27.6857, 86.7278], // Starting Pos LNG/LAT
  zoom: 9, // Starting Zoom
});

function animate() {
  requestAnimationFrame(animate);
}

map.on("style.load", function () {
  animate();

  map.addLayer({
    id: "custom_layer",
    type: "custom",
    renderingMode: "3d",
    onAdd: function (map, mbxContext) {
      console.log({ map });
      console.log({ mbxContext });
      console.log({ Threebox });
      // instantiate threebox
      window.tb = new Threebox(map, mbxContext, { defaultLights: true });

      //instantiate a red sphere and position it at the origin lnglat
      const sphere = window.tb
        .sphere({
          color: "red",
          material: "MeshToonMaterial",
        })
        .setCoords(origin);
      //add sphere to the scene
      window.tb.add(sphere);
    },

    render: function (gl, matrix) {
      window.tb.update();
      console.log("render");
    },
  });
});
