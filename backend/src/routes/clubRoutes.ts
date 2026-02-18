import { Router } from "express";
import {
  getClubs,
  getClubById,
  getAvailableClubs,
} from "../controllers/clubController";
import { authMiddleware } from "../middlewares/auth";

const clubRouter = Router();

clubRouter.get("/", authMiddleware, getClubs);
clubRouter.get("/available", authMiddleware, getAvailableClubs);
clubRouter.get("/:id", getClubById);

export default clubRouter;
