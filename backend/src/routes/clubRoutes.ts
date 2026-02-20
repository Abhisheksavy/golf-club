import { Router } from "express";
import {
  getClubs,
  getClubById,
  getAvailableClubs,
} from "../controllers/clubController";

const clubRouter = Router();

clubRouter.get("/", getClubs);
clubRouter.get("/available", getAvailableClubs);
clubRouter.get("/:id", getClubById);

export default clubRouter;
