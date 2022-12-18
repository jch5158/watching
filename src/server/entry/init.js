import "dotenv/config";
import "./initDB";
import "./initRedis";
import "./initDir";
import "../models/User";
import app from "./server";

// PORT 넘버
const PORT = app.get("port");

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));
