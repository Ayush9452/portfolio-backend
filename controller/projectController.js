import { catchasyncerrors } from "../middlewares/catchasyncerror.js";
import Errorhandler from "../middlewares/error.js";
import { Project } from "../models/projectSchema.js";
import cloudinary from "cloudinary"

export const addNewProject = catchasyncerrors(async (req, res, next) => {
    const {
        title,
        description,
        gitRepoLink,
        projectLink,
        technologies,
        stack,
        deployed,
    } = req.body;
    if ( !title || !description || !gitRepoLink || !projectLink || !technologies || !stack || !deployed ) {
        return next(new Errorhandler("All Fields are Important!",400));
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new Errorhandler("Project Banner is required", 400));
    }
    const { projectBanner } = req.files;
    const cloudinaryresponse = await cloudinary.uploader.upload(
        projectBanner.tempFilePath,
        { folder: "PROJECT BANNERS" }
    );
    if (!cloudinaryresponse || cloudinaryresponse.error) {
        console.error(
            "cloudinary error:", cloudinaryresponse.error || "Unknow cloudinary error"
        );
    }
    const newProject = await Project.create({
        title,
        description,
        gitRepoLink,
        projectLink,
        technologies,
        stack,
        deployed,
        projectBanner: {
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    });

    res.status(200).json({
        success: true,
        message: "New Project Added Successfully!",
        newProject
    });
});

export const updateProject = catchasyncerrors(async (req, res, next) => {
    const { id } = req.params;
    let project = await Project.findById(id);
    if (!project) {
        return next(new Errorhandler("Software Project not found!", 404));
    }

    const newProject = {
        title: req.body.title,
        description: req.body.description,
        gitRepoLink: req.body.gitRepoLink,
        projectLink: req.body.projectLink,
        technologies: req.body.technologies,
        stack: req.body.stack,
        deployed: req.body.deployed,
    }

    if (req.files && req.files.projectBanner) {
        const { projectBanner } = req.files;
        const project = await Project.findById(id);
        const projectImage = project.projectBanner.public_id;
        await cloudinary.uploader.destroy(projectImage);
        const cloudinaryresponse = await cloudinary.uploader.upload(
            projectBanner.tempFilePath,
            { folder: "PROJECT BANNERS" }
        )
        if (!cloudinaryresponse || cloudinaryresponse.error) {
            console.error(
                "cloudinary error:", cloudinaryresponse.error || "Unknow cloudinary error"
            );
        };
        newProject.projectBanner = {
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    }

    project = await Project.findByIdAndUpdate(id, newProject, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: "Project Updated Successfully!",
        project
    });
});

export const deleteProject = catchasyncerrors(async (req, res, next) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
        return next(new Errorhandler("Software Project not found!", 404));
    }
    const projectBanner = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectBanner);
    await project.deleteOne();
    res.status(200).json({
        success: true,
        message: "Software Project Deleted!"
    });
});

export const getAllProject = catchasyncerrors(async (req, res, next) => {
    const allProject = await Project.find();
    res.status(200).json({
        success: true,
        allProject,
    });
});

export const getSingleProject = catchasyncerrors(async (req, res, next) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
        return next(new Errorhandler("Project Not Found!", 404));
    }
    res.status(200).json({
        success: true,
        project
    })
})