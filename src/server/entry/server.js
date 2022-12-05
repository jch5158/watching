import express from "express";
import morgan from "morgan";
import rootRouter from "../routers/rootRouter";

const PORT = 7000;

const app = express();
const logger = morgan("dev");

app.use(logger);
app.use("/", rootRouter);

app.listen(PORT, () => {
  console.log(`Server listening PORT : ${PORT}`);
});
