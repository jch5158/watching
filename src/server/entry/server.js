import express from "express";
import morgan from "morgan";
import rootRouter from "../routers/rootRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/client/views");

app.use(logger);
app.use("/", rootRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening PORT : ${process.env.PORT}`);
});

export default app;
