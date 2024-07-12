import {catchasyncerrors} from "../middlewares/catchasyncerror.js"
import Errorhandler from "../middlewares/error.js"
import { Message } from "../models/messageSchema.js"

export const sendMessage = catchasyncerrors(async(req,res,next)=>{
    const {senderName, subject, message} = req.body;
    if(!senderName || !subject || !message){
        return next(new Errorhandler("Please fill full form",400));
    }
    const data = await Message.create({senderName, subject, message}); 
    res.status(200).json({
        success: true,
        message: "Message Sent",
        data,
    });
});

export const getAllMessage = catchasyncerrors(async(req,res,next)=>{
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages,
    });
})

export const deleteMessage = catchasyncerrors(async(req,res,next)=>{
    const {id} = req.params;
    const message = await Message.findById(id);
    if(!message){
        return next(new Errorhandler("message of given id not found",404));
    }

    await message.deleteOne();
    res.status(200).json({
        success: true,
        message: "Message deleted"
    });
})