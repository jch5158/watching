import express from "express";
import session from "express-session";
import redisClient from "./initRedis";
import connectRedis from "connect-redis";
import flash from "express-flash";
import morgan from "morgan";
import apiRouter from "../routers/apiRouter";
import rootRouter from "../routers/rootRouter";
import userRouter from "../routers/userRouter";
import {
  error404Middleware,
  localsMiddleware,
  setNicknameMiddleware,
} from "./middlewares";

const app = express();
const logger = morgan("dev");
const RedisStore = connectRedis(session);

app.set("port", process.env.PORT);
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(logger);
app.use("/uploads", express.static("uploads")); // 브라우저가 upload 폴더에 접근할 수 있도록 등록
app.use("/assets", express.static("assets")); // 브라우저가 assets 폴더에 접근할 수 있도록 등록
app.use("/resources", express.static("resources"));
app.use(flash());
app.use(express.urlencoded({ extended: true })); // from 데이터를 읽기 위한 middleware
app.use(express.text());
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1296000000,
    },
    store: new RedisStore({
      client: redisClient,
      prefix: "session:",
    }),
  })
);

app.use(localsMiddleware);
app.use(setNicknameMiddleware);
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);
app.use((err, req, res, next) => {
  console.log(err);
  return res.render("screens/root/error", {
    pageTitle: 500,
    status: 500,
    message: "일시적으로 서버의 문제가 발생되었습니다.",
  });
});
app.use((req, res, next) => {
  return res.render("screens/root/404", {
    pageTitle: 404,
    status: 404,
    message: "페이지를 찾을 수 없습니다.",
  });
});

export default app;
