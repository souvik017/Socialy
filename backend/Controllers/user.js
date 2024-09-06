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
    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    user.password = undefined;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(400).send("Error. Try again.");
  }
};

const allUser = async (req, res) => {
  const keyword = req.query.search
  ? {
  $or: [
  { name: { $regex: req.query.search, $options: "i" } },
  ],
  }
  : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user?._id } });
  res.send(users); 

};

const findUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming userId is passed as a route parameter
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};



  export { login , newUser, allUser,findUser };