import { Router } from "express";
import { getCourses, getAvailableDates, getAvailableDatesForBag } from "../controllers/courseController";

const courseRouter = Router();

courseRouter.get("/", getCourses);
courseRouter.get("/:locationId/available-dates-for-bag", getAvailableDatesForBag);
courseRouter.get("/:locationId/available-dates", getAvailableDates);

export default courseRouter;
