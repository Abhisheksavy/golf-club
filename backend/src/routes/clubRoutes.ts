import { Router } from "express";
import { createClub, editClub } from "../controllers/clubController";

const clubRouter = Router();
clubRouter.post("/createClub", createClub);
clubRouter.post("/editClub", editClub);
export default clubRouter;
