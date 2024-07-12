import Errorhandler from "./error.js";
import jwt from 'jsonwebtoken'
import {catchasyncerrors} from "./catchasyncerror.js"
import { User } from "../models/userSchema.js";


export const isAuthenticated = catchasyncerrors(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new Errorhandler("User Not Authenticated",400));
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
})