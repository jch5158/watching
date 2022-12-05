import express from "express";
import morgan from "morgan";
import rootRouter from "../routers/rootRouter";
import usersRouter from "../routers/usersRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(logger);
app.use(express.urlencoded({ extended: true })); // from 데이터를 읽기 위한 middleware
app.use("/uploads", express.static("uploads")); // 브라우저가 upload 폴더 접근할 수 있도록 등록
app.use("/", rootRouter);
app.use("/users", usersRouter);

export default app;
