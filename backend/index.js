import express from "express";
const app = express();
import userRoute from "./Routes/user.js"
import dotenv from "dotenv"
import mongoose from "mongoose";

const port = process.env.PORT || 3000;
dotenv.config({
    path: "./.env"
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running at port : ${port}`);
});


app.use("/user", userRoute);

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("Database Connected Succesfully");
  })
  .catch((err) => console.log("DB CONNECTION ERR => ", err));
