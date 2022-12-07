import express from "express";
import morgan from "morgan";
import apiRouter from "../routers/apiRouter";
import rootRouter from "../routers/rootRouter";
import usersRouter from "../routers/userRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(logger);
app.use(express.urlencoded({ extended: true })); // from 데이터를 읽기 위한 middleware
app.use(express.text());
app.use("/uploads", express.static("uploads")); // 브라우저가 upload 폴더에 접근할 수 있도록 등록
app.use("/assets", express.static("assets")); // 브라우저가 assets 폴더에 접근할 수 있도록 등록
app.use("/", rootRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);

export default app;
