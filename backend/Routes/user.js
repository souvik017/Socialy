import express from "express";
import { login, newUser } from "../Controllers/user.js";

const app = express.Router();

app.post('/login', login);
app.post('/new', newUser);


  export default app;