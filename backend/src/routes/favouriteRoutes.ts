import { Router } from "express";
import {
  createFavourite,
  getFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
} from "../controllers/favouriteController";

const favouriteRouter = Router();

favouriteRouter.post("/", createFavourite);
favouriteRouter.get("/", getFavourites);
favouriteRouter.get("/:id", getFavouriteById);
favouriteRouter.put("/:id", updateFavourite);
favouriteRouter.delete("/:id", deleteFavourite);

export default favouriteRouter;
