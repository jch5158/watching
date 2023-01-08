import "dotenv/config";
import "./initDB";
import "./initRedis";
import "../models/User";
import "../models/UserVideo";
import "../models/Subscriber";
import "../models/SubscribeUser";
import "../models/UserVideoComment";
import "../models/UserVideoSubComment";
import fileSystem from "../modules/fileSystem";
import app from "./server";

fileSystem.folderExistsAndCreateSync(`${process.cwd()}/error-log`);

// PORT 넘버
const PORT = app.get("port");

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));
