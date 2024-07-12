import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbconnetion from "./database/dbconnnection.js"
import { errormiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouters.js"
import userRouter from "./router/userRouters.js"
import timelineRouters from "./router/timelineRouters.js"
import softwareApplicationRouters from "./router/softwareApplicationRouters.js"
import skillRouters from "./router/skillRouters.js"
import projectRouters from "./router/projectRouters.js"

const app = express();
dotenv.config({path: "./config/.env"});

app.use(cors({
    origin: [process.env.PORTFOLIO_URL,process.env.DASHBOARD_URL],
    methods: ['GET','POST','DELETE','PUT'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

app.use("/api/v1/message",messageRouter);
app.use("/api/v1/user",userRouter)
app.use("/api/v1/timeline",timelineRouters)
app.use("/api/v1/application",softwareApplicationRouters)
app.use("/api/v1/skill",skillRouters)
app.use("/api/v1/project",projectRouters)

dbconnetion();
app.use(errormiddleware)

export default app;