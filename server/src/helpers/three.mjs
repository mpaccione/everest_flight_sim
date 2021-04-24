import * as THREE from "three";
import fs from "fs";
import Canvas from "canvas";
import path from "path";

const __dirname = path.resolve(path.dirname(""));

async function getPixels(imagePath) {
  try {
    const data = await fs.promises.readFile(
      __dirname + imagePath,
      function (err, data) {
        if (err) throw err;
        const img = new Canvas.Image(); // Create a new Image
        img.src = data;

        // Initialize a new Canvas with the same dimensions
        // as the image, and get a 2D drawing context for it.
        const canvas = Canvas.createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        return imgData;
      }
    );
    return data;
  } catch (err) {
    console.error(err);
  }
}

function rgbToHeight(r, g, b) {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
}

export const tileToMesh = async (rgbTilePath, textureTilePath) => {
  try {
    const pixels = await getPixels(rgbTilePath);
    console.log({pixels})
    const planeSize = parseInt(Math.sqrt(pixels.length / 4));
    console.log({planeSize})

    const geometry = new THREE.default.PlaneGeometry(
      planeSize,
      planeSize,
      415,415
    //   planeSize - 1,
    //   planeSize - 1
    );

console.log({geometry})
console.log(geometry.attributes.position)
console.log(pixels.length)

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i + 0];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const height = rgbToHeight(r, g, b);

      if (!geometry.vertices[i / 4]) {
        console.error(`No vertices at index ${i / 4} found.`);
        break;
      }
      geometry.vertices[i / 4].z = height;
    }

    geometry.verticesNeedUpdate = true;

    const texture = new THREE.TextureLoader().load(textureTilePath);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  } catch (err) {
    console.error(err);
  }
  console.log(rgbTilePath, textureTilePath);
};
