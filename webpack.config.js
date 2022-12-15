const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const outputPath = path.resolve(__dirname, "assets");

module.exports = {
  entry: {
    main: "./src/client/js/main.js",
    "users/join": "./src/client/js/users/join.js",
    "users/set-nickname": "./src/client/js/users/set-nickname.js",
  },
  output: {
    filename: "js/[name].js", // [name]을 사용해서 output 파일의 이름이 겹치지 않도록 한다.
    path: outputPath, // output 경로는 무조건 절대경로여야 한다.
    clean: true, // 기존 output 파일을 지워준다.
  },
  plugins: [new MiniCssExtractPlugin({ filename: "css/styles.css" })],
  module: {
    rules: [
      {
        test: /\.js$/, // .js 확장자 대상
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
