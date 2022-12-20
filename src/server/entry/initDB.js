import mongoose from "mongoose";

const db = mongoose.connection;
db.on("error", (error) => console.log(`DB Error\n${error}`));
db.once("open", () => console.log("Connected to DB"));

mongoose.connect(process.env.DB_URL);
