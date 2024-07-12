import { catchasyncerrors } from "../middlewares/catchasyncerror.js";
import Errorhandler from "../middlewares/error.js";
import { SoftwareApplication } from "../models/softwareApplicationSchema.js";
import cloudinary from "cloudinary"

export const addNewApplication = catchasyncerrors(async (req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new Errorhandler("Application SVG is required",400));
    }
    const {svg} =  req.files;
    const cloudinaryresponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        {folder: "APPLICATION_SVGS"}
    )
    if(!cloudinaryresponse || cloudinaryresponse.error){
        console.error(
            "cloudinary error:", cloudinaryresponse.error || "Unknow cloudinary error"
        );
    }
    const {name} = req.body;
    const newApplication =  await SoftwareApplication.create({
        name,
        svg:{
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    });

    res.status(200).json({
        success: true,
        message: "New Application Added Successfully",
        newApplication
    })
})
export const deleteApplication = catchasyncerrors(async (req,res,next)=>{
    const {id} = req.params;
    const application = await SoftwareApplication.findById(id);
    if(!application){
        return next(new Errorhandler("Software Application not found!",404));
    }
    const svg = application.svg.public_id;
    await cloudinary.uploader.destroy(svg);
    await application.deleteOne();
    res.status(200).json({
        success: true,
        message: "Software Application Deleted!"
    })
})

export const getAllApplication = catchasyncerrors(async (req,res,next)=>{
    const AllApplication = await SoftwareApplication.find();
    res.status(200).json({
        success: true,
        AllApplication,
    })
})