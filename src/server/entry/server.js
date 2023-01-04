import express from "express";
import session from "express-session";
import redisClient from "./initRedis";
import connectRedis from "connect-redis";
import flash from "express-flash";
import morgan from "morgan";
import apiRouter from "../routers/apiRouter";
import rootRouter from "../routers/rootRouter";
import userRouter from "../routers/userRouter";
import userVideoRouter from "../routers/userVideoRouter";
import middlewares from "../modules/middlewares";
import cookieParser from "cookie-parser";

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
app.use(cookieParser());
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

app.use(middlewares.localsMiddleware);
app.use(middlewares.setNicknameMiddleware);
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/user-videos", userVideoRouter);
app.use("/api", apiRouter);
app.use(middlewares.error500Middleware);
app.use(middlewares.error404Middleware);

export default app;
