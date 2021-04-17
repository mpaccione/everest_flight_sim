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
  // Convert for Mapbox
  const xyzTilebelt = tilebelt.pointToTile(long, lat, zoom);

  try {
    // Example from Docs - Omaha, Nebraska
    // const response = await fetch(
    //   `https://api.mapbox.com/v4/mapbox.terrain-rgb/14/12558/6127.pngraw?access_token=${process.env.ACCESS_TOKEN}`
    // );
    // const filename = "omaha-rgb.png"

    const response = await fetch(
      `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${xyzTilebelt[0]}/${xyzTilebelt[1]}.pngraw?access_token=${process.env.ACCESS_TOKEN}`
    );
    const filename = "everest-rgb.png";

    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(`./data/${filename}`);
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
};

queryMapbox(); // Test
