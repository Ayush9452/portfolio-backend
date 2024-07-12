import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { addNewProject, deleteProject, getAllProject, updateProject, getSingleProject } from "../controller/projectController.js";

const router = express.Router();

router.post("/add",isAuthenticated,addNewProject)
router.delete("/delete/:id",isAuthenticated,deleteProject);
router.put("/update/:id",isAuthenticated,updateProject);
router.get("/getall",getAllProject);
router.get("/getsingle/:id",getSingleProject);

export default router;