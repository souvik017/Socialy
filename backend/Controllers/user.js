import  User  from '../Models/user.js';
import { hashPassword, comparePassword } from "./../utils/auth.js";
import jwt from "jsonwebtoken";

const newUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");
    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password : hashedPassword,
    });
    await user.save();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({ user , token });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

const login =  async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Invalid password");
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    user.password = undefined;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(400).send("Error. Try again.");
  }
};


  export { login , newUser };