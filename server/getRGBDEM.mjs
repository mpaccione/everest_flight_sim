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

  // Get 4 Tiles
  const fourTileArr = tilebelt.getChildren(bboxTile);

  // Get 16 Tiles
  const sixteenTileArr = fourTileArr.map((tile) => {
    return tilebelt.getChildren(tile);
  });

  // Get 64 Tiles
  const sixtyFourTileArr = sixteenTileArr.map((tileArr) => {
    return tileArr.map((tile) => {
      return tilebelt.getChildren(tile);
    });
  });

  // Get 256 Tiles
  const twoHundredFiftySixTileArr = sixtyFourTileArr.map((tileArr1) => {
    return tileArr1.map((tileArr2) => {
      return tileArr2.map((tile) => {
        return tilebelt.getChildren(tile);
      });
    });
  });

  /////////////////////////////////////
  // Downloads Tileset Covering BBOX //
  /////////////////////////////////////
  downloadTileset(twoHundredFiftySixTileArr, "everest-rgb");
  async function downloadTileset(tilesetArr, filename) {
    tilesetArr.forEach((childArr1, index1) => {
      childArr1.forEach((childArr2, index2) => {
        childArr2.forEach((childArr3, index3) => {
          childArr3.forEach((tile, index4) => {
            getTileImage(tile, index1, index2, index3, index4);
          });
        });
      });
    });

    async function getTileImage(tile, index1, index2, index3, index4) {
      // RGB TILE
      try {
        const path = `./data/rgb/${filename}-${index1}-${index2}-${index3}-${index4}.png`;
        // Check if File Exists - if not download
        if (!fs.existsSync(path)) {
          const response = await fetch(
            `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tile[2]}/${tile[0]}/${tile[1]}@2x.pngraw?access_token=${process.env.ACCESS_TOKEN}`
          );

          // Create File
          const fileStream = fs.createWriteStream(path);
          response.body.pipe(fileStream);
          response.body.on("error", (err) => {
            console.error(err);
          });
        }
      } catch (err) {
        console.error(err);
      }

      // TERRAIN TILE
      try {
        const path = `./data/satellite/${filename}-${index1}-${index2}-${index3}-${index4}.jpg`
        // Check if File Exists - if not download
        if (!fs.existsSync(path)) {
          const response = await fetch(
            `https://api.mapbox.com/v4/mapbox.satellite/${tile[2]}/${tile[0]}/${tile[1]}@2x.jpg?access_token=${process.env.ACCESS_TOKEN}`
          );

          const fileStream = fs.createWriteStream(path);
          response.body.pipe(fileStream);
          response.body.on("error", (err) => {
            console.error(err);
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
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
