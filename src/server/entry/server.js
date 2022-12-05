import express from "express";
const PORT = 7000;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening PORT : ${PORT}`);
});
