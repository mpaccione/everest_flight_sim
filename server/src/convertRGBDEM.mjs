import { tileToMesh } from "./helpers/three.mjs";

(async function () {
  const test = await tileToMesh(
    "/data/rgb/everest-rgb-0-0-0-0.png",
    "/data/satellite/everest-rgb-0-0-0-0.jpg"
  );
  console.log(test);
})();
