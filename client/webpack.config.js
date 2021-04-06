import MiniCssExtractPlugin from "mini-css-extract-plugin";

let dirname = "C:/Projects/everest_flight_sim/client";
console.log({ dirname });

// webpack.config.js
export default {
  mode: "development",
  entry: ["./src/index.mjs", "./src/styles.css"],
  output: {
    path: dirname,
    publicPath: "/",
    filename: "./dist/bundle.js",
  },
  watch: true,
  resolve: {
    modules: [dirname + "/node_modules/"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./dist/styles.css",
    }),
  ],
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
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
};
