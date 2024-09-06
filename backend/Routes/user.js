import express from "express";
import { login, newUser , allUser, findUser } from "../Controllers/user.js";
import { protect } from "../Middlewares/authMiddleware.js";

const app = express.Router();

app.post('/login', login);
app.post('/new', newUser);
app.get('/allUser', protect , allUser);
app.get('/:userId', protect , findUser);

  export default app;