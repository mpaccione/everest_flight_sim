// webpack.config.js
export default {
  mode: "development",
  entry: ["./src/index.js", "./src/index.css"],
  output: {
    path: __dirname,
    publicPath: "/",
    filename: "./dist/bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "script-loader",
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
