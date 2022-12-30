const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const outputPath = path.resolve(__dirname, "assets");

const baseUrl = "./src/client/js";

module.exports = {
  entry: {
    main: `${baseUrl}/main.js`,
    "users/join": `${baseUrl}/users/join.js`,
    "users/set-nickname": `${baseUrl}/users/set-nickname.js`,
    "users/edit-profile": `${baseUrl}/users/edit-profile.js`,
    "users/edit-password": `${baseUrl}/users/edit-password.js`,
    "user-videos/upload": `${baseUrl}/user-videos/upload.js`,
    "user-videos/watch": `${baseUrl}/user-videos/watch.js`,
    "modules/userApi": `${baseUrl}/modules/userApi.js`,
    "modules/userVideoApi": `${baseUrl}/modules/userVideoApi.js`,
    "validators/userValidator": `${baseUrl}/validators/userValidator.js`,
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
