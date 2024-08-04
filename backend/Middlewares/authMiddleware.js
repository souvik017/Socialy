import jwt from "jsonwebtoken";
import user from "../Models/user.js";
import dotenv from "dotenv"




const protect = async (req, res , next)=>{
    let token;
    const jwtSecret = process.env.JWT_SECRET;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
        ) {
        try {
        token = req.headers.authorization.split(" ")[1];
        
        //decodes token id
        const decoded = jwt.verify(token, jwtSecret);
    
        req.user = await user.findById(decoded._id).select("-password");
        next()
        }catch (error) {
        res.status(401);
        // throw new Error("Not authorized, token failed" );
        console.log(error)
        }
}
if (!token) {
    res.status(401);
    throw new Error("Not authorized, token failed");
}
}

export {protect};