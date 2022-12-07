import "dotenv/config";
import "./initDB";
import "./initRedis";
import "../models/User";
import app from "./server";

// PORT 넘버
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));
