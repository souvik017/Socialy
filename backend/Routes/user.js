import express from "express";
import { login, newUser , allUser } from "../Controllers/user.js";
import { protect } from "../Middlewares/authMiddleware.js";

const app = express.Router();

app.post('/login', login);
app.post('/new', newUser);
app.get('/allUser', protect , allUser);


  export default app;