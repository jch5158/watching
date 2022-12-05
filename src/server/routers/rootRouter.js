import express from "express";
import { home } from "../controllers/rootControllers";

const rootRouter = express.Router();

rootRouter.get("/", home);

export default rootRouter;
