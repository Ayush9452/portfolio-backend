import { catchasyncerrors } from "../middlewares/catchasyncerror.js";
import Errorhandler from "../middlewares/error.js";
import { Skill } from "../models/skillSchema.js";
import cloudinary from "cloudinary"

export const addNewSkill = catchasyncerrors(async (req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new Errorhandler("Skill SVG is required",400));
    }
    const {svg} =  req.files;
    const cloudinaryresponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        {folder: "SKILL_SVGS"}
    );
    if(!cloudinaryresponse || cloudinaryresponse.error){
        console.error(
            "cloudinary error:", cloudinaryresponse.error || "Unknow cloudinary error"
        );
    }
    const {name,proficiency} = req.body;
    const newSkill =  await Skill.create({
        name,
        proficiency,
        svg:{
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    });

    res.status(200).json({
        success: true,
        message: "New Skill Added Successfully!",
        newSkill
    });
});

export const updateSkill = catchasyncerrors(async (req,res,next)=>{
    const {id} = req.params;
    let skill = await Skill.findById(id);
    if(!skill){
        return next(new Errorhandler("Software Skill not found!",404));
    }
    
    const {proficiency} = req.body;
    skill = await Skill.findByIdAndUpdate(id,{proficiency},{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: "Skill Updated Successfully!",
        skill
    });
});

export const deleteSkill = catchasyncerrors(async (req,res,next)=>{
    const {id} = req.params;
    const skill = await Skill.findById(id);
    if(!skill){
        return next(new Errorhandler("Software Skill not found!",404));
    }
    const svg = skill.svg.public_id;
    await cloudinary.uploader.destroy(svg);
    await skill.deleteOne();
    res.status(200).json({
        success: true,
        message: "Software Skill Deleted!"
    });
});

export const getAllSkill = catchasyncerrors(async (req,res,next)=>{
    const allSkills = await Skill.find();
    res.status(200).json({
        success: true,
        allSkills,
    });
});