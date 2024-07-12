import { catchasyncerrors } from "../middlewares/catchasyncerror.js";
import Errorhandler from "../middlewares/error.js";
import { Timeline } from "../models/timelineSchema.js";

export const postTimeline = catchasyncerrors(async (req,res,next)=>{
    const {title,description,from,to} = req.body;
    const newtimeline = await Timeline.create({title,description,timeline:{from,to}});
    res.status(200).json({
        success: true,
        message: "Timeline Added",
        newtimeline
    });
})
export const deleteTimeline = catchasyncerrors(async (req,res,next)=>{
    const {id} = req.params;
    const timeline = await Timeline.findById(id);
    if(!timeline){
        return next(new Errorhandler("Timeline of the Given id is not Found",404));
    }
    await timeline.deleteOne();
    res.status(200).json({
        success: true,
        message: "Timeline Deleted Successfully",
    })
})

export const getAllTimeline = catchasyncerrors(async (req,res,next)=>{
    const timelines = await Timeline.find();
    res.status(200).json({
        success: true,
        timelines,
    })
})