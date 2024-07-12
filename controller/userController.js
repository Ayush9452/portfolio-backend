import { catchasyncerrors } from "../middlewares/catchasyncerror.js";
import Errorhandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const register = catchasyncerrors(async (req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new Errorhandler("Avatar and Resume are required",400));
    }
    const {avatar,resume} = req.files;
    const cloudinaryresponseforAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {folder: "AVATARS"}
    );
    if(!cloudinaryresponseforAvatar || cloudinaryresponseforAvatar.error){
        console.error(
            "cloudinary error:", cloudinaryresponseforAvatar.error || "Unknow cloudinary error"
        );
    };

    const cloudinaryresponseforResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {folder: "MY_RESUME"}
    );
    if(!cloudinaryresponseforResume || cloudinaryresponseforResume.error){
        console.error(
            "cloudinary error:", cloudinaryresponseforResume.error || "Unknow cloudinary error"
        );
    };

    const {
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        instagramURL,
        linkedInURL,
    } = req.body;

    const user = await User.create({
        fullName,
        email,
        phone,
        aboutMe,
        password,
        portfolioURL,
        githubURL,
        instagramURL,
        linkedInURL,
        avatar:{
            public_id: cloudinaryresponseforAvatar.public_id,
            url: cloudinaryresponseforAvatar.secure_url
        },
        resume:{
            public_id: cloudinaryresponseforResume.public_id,
            url: cloudinaryresponseforResume.secure_url
        }
    }); 

    generateToken(user,"User registered",201,res);
})

export const login = catchasyncerrors(async (req,res,next)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return next(new Errorhandler("Email and Password are required.",400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new Errorhandler("Invalid Email or Password!",404));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new Errorhandler("Invalid Email or Password!",401));
    }
    generateToken(user,"Logged in",200,res);
})

export const logout = catchasyncerrors(async (req,res,next)=>{
    res.status(200).cookie("token","",{
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "None",
        secure: true
    }).json({
        success: true,
        message: "User Logged Out",
    });
});

export const getUser = catchasyncerrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    })
})

export const updateProfile = catchasyncerrors(async (req,res,next)=>{
    const newUserData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        githubURL: req.body.githubURL,
        instagramURL: req.body.instagramURL,
        portfolioURL: req.body.portfolioURL,
        linkedInURL: req.body.linkedInURL,
    };
    if(req.files && req.files.avatar){
        const {avatar} = req.files;
        const user = await User.findById(req.user.id);
        const userImage = user.avatar.public_id;
        await cloudinary.uploader.destroy(userImage);
        const cloudinaryresponse = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {folder: "AVATARS"}
        );
        if(!cloudinaryresponse || cloudinaryresponse.error){
            console.error(
                "cloudinary error:", cloudinaryresponse.error || "Unknow cloudinary error"
            );
        };
        newUserData.avatar = {
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    }
    if(req.files && req.files.resume){
        const {resume} = req.files;
        const user = await User.findById(req.user.id);
        const userResume = user.resume.public_id;
        await cloudinary.uploader.destroy(userResume);
        const cloudinaryresponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {folder: "MY_RESUME"}
        );
        if(!cloudinaryresponse || cloudinaryresponse.error){
            console.error(
                "cloudinary error:", cloudinaryresponse.error || "Unknow cloudinary error"
            );
        };
        newUserData.resume = {
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        message: "Profile Updated!",
        user
    });
});

export const updatePassword = catchasyncerrors(async (req,res,next)=>{
    const {currentPassword, newPassword, confirmNewPassword} = req.body;
    if(!currentPassword || !newPassword || !confirmNewPassword){
        return next(new Errorhandler("Fill All Fields.",400));
    }
    if(newPassword !== confirmNewPassword){
        return next(new Errorhandler("New password Is Not Matching With Confirm New Password.",400));
    }
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if(!isPasswordMatch){
        return next(new Errorhandler("Incorrect Current Password.",400));
    }
    if(newPassword === currentPassword){
        return next(new Errorhandler("New password Must Not Be The Current Password!",400));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password Updated"
    })
})

export const getUserForPortfolio = catchasyncerrors(async (req,res,next)=>{
    const id = process.env.PORTFOLIO_ID;
    const user = await User.findById(id);
    res.status(200).json({
        success: true,
        user
    });
});

export const forgotPassword = catchasyncerrors(async (req,res,next)=>{
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return next(new Errorhandler("User Not Found",404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});
    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;
    const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If You've not requested this email then, please ignore this.`;
try {
    await sendEmail({
        email: user.email,
        subject: "Personal Portfolio Dashboard Recovery Password",
        message,
    });

    res.status(200).json({
        success: true,
        message: `Message sent to ${user.email} Successfully.`
    })
} catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    return next(new Errorhandler(error.message,500));
}
});

export const resetPassword = catchasyncerrors(async (req,res,next)=>{
    const {token} = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},
    });
    if(!user){
        return next(new Errorhandler("Reset Password Token is Invalid or has been Expired",400));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new Errorhandler("Passwrod and Confirm Password Do Not match!",400));
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    generateToken(user,"Reset Password Successfully.",200,res);
})