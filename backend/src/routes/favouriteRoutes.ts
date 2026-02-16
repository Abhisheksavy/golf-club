import { Router } from "express";
import { favourite } from "../controllers/favouriteController";

const favouriteRouters = Router();
favouriteRouters.post("/favourite", favourite);
export default favouriteRouters;
