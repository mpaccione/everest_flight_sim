let dirname = "C:/Projects/everest_flight_sim/client";
console.log({ dirname });

// webpack.config.js
export default {
  mode: "development",
  entry: ["./src/index.mjs", "./src/index.css"],
  output: {
    path: dirname,
    publicPath: "/",
    filename: "./dist/bundle.js",
  },
  resolve: {
    // alias: {
    //   classes: dirname + "/src/classes/",
    //   listeners: dirname + "/src/listeners/",
    // },
    modules: [dirname + "/node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
