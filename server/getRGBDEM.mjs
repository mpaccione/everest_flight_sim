import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import tilebelt from "@mapbox/tilebelt";

dotenv.config();

const queryMapbox = async () => {
  // Coords
  const zoom = 14;
  const long = 86.922623;
  const lat = 27.986065;
  const topLeft = { lat: 28.08416, long: 86.622876 }; // Top Left Corner
  const bottomRight = { lat: 27.680334, long: 87.230674 }; // Bottom Right Corner
  // Convert for Mapbox
  const xyzTile = tilebelt.pointToTile(long, lat, zoom);
  const bboxTile = tilebelt.bboxToTile([
    topLeft.long,
    topLeft.lat,
    bottomRight.long,
    bottomRight.lat,
  ]);
  // Get Higher Zoom Level

  /////////////////////////////////////
  // Downloads Tileset Covering BBOX //
  /////////////////////////////////////
  downloadTileset(bboxTile, "everest-rgb");
  async function downloadTileset(bboxTile, filename) {
    const tilesetArr = tilebelt.getChildren(bboxTile);
    let count = 0;

    (async function recursiveAJAX(tile, index) {
      // RGB TILE
      try {
        const response = await fetch(
          `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tile[2]}/${tile[0]}/${tile[1]}@2x.pngraw?access_token=${process.env.ACCESS_TOKEN}`
        );

        await new Promise((resolve, reject) => {
          const fileStream = fs.createWriteStream(
            `./data/rgb/${filename}-${index}.png`
          );
          response.body.pipe(fileStream);
          response.body.on("error", (err) => {
            reject(err);
          });
          fileStream.on("finish", function () {
            resolve();
          });
        });

        console.log({ response });
      } catch (err) {
        console.error(err);
      }

      // TERRAIN TILE
      try {
        const response = await fetch(
          `https://api.mapbox.com/v4/mapbox.satellite/${tile[2]}/${tile[0]}/${tile[1]}@2x.jpg?access_token=${process.env.ACCESS_TOKEN}`
        );

        await new Promise((resolve, reject) => {
          const fileStream = fs.createWriteStream(
            `./data/satellite/${filename}-${index}.jpg`
          );
          response.body.pipe(fileStream);
          response.body.on("error", (err) => {
            reject(err);
          });
          fileStream.on("finish", function () {
            resolve();
            // Iterate until all tiles are complete
            if (tilesetArr.length > 0) {
              count++;
              recursiveAJAX(tilesetArr.shift(), count);
            }
          });
        });

        console.log({ response });
      } catch (err) {
        console.error(err);
      }
    })(tilesetArr.shift(), 0);
  }

  /////////////////////////////////////////
  // Downloads Single Tile Covering BBOX //
  /////////////////////////////////////////

  // downloadSingleTile(bboxTile, "everest-rgb")
  async function downloadSingleTile(bboxTile, filename) {
    try {
      // Example from Docs - Omaha, Nebraska
      // const response = await fetch(
      //   `https://api.mapbox.com/v4/mapbox.terrain-rgb/14/12558/6127.pngraw?access_token=${process.env.ACCESS_TOKEN}`
      // );
      // const filename = "omaha-rgb.png"

      const response = await fetch(
        `https://api.mapbox.com/v4/mapbox.terrain-rgb/${bboxTile[2]}/${bboxTile[0]}/${bboxTile[1]}.pngraw?access_token=${process.env.ACCESS_TOKEN}`
      );

      await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(`./data/rgb/${filename}.png`);
        response.body.pipe(fileStream);
        response.body.on("error", (err) => {
          reject(err);
        });
        fileStream.on("finish", function () {
          resolve();
        });
      });

      console.log({ response });
    } catch (err) {
      console.error(err);
    }
  }
};

queryMapbox(); // Test
