import { Router } from "express";
import { getCourses, getAvailableDates } from "../controllers/courseController";

const courseRouter = Router();

courseRouter.get("/", getCourses);
courseRouter.get("/:locationId/available-dates", getAvailableDates);

export default courseRouter;
