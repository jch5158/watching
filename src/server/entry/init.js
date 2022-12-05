import "dotenv/config";
import "./initDB";
import app from "./server";

// PORT 넘버
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));
