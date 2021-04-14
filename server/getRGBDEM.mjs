import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import SphericalMercator from "@mapbox/sphericalmercator";

dotenv.config();

const queryMapbox = async () => {
  const merc = new SphericalMercator({
    size: 256,
  });
  const xyFromLatLong = (lat, long, merc) => {
    return merc.forward([long, lat]);
  };

  const zoom = 9;
  const long = 86.922623;
  const lat = 27.986065;
  const xyPos = xyFromLatLong(lat, long, merc);

  console.log({ xyPos });

  try {
    // Example from Docs - Omaha, Nebraska
    const response = await fetch(
      `https://api.mapbox.com/v4/mapbox.terrain-rgb/14/12558/6127.pngraw?access_token=${process.env.ACCESS_TOKEN}`
    );

    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream("./data/omaha-rgb.png");
      response.body.pipe(fileStream);
      response.body.on("error", (err) => {
        reject(err);
      });
      fileStream.on("finish", function () {
        resolve();
      });
    });
    // const response = await fetch(
    //   `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${xyPos[0]}/${xyPos[1]}.pngraw?access_token=${process.env.ACCESS_TOKEN}`
    // );

    console.log({ response });
    // console.log({ res });
  } catch (err) {
    console.error(err);
  }
};

queryMapbox(); // Test
