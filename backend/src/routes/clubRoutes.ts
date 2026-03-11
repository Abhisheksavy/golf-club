import { Router } from "express";
import {
  getClubs,
  getClubById,
  getAvailableClubs,
  getCollectionsHandler,
} from "../controllers/clubController";

const clubRouter = Router();

clubRouter.get("/", getClubs);
clubRouter.get("/available", getAvailableClubs);
clubRouter.get("/collections", getCollectionsHandler);

// Temporary: inspect a single product to see product_group_id field
clubRouter.get("/debug/collections", async (_req, res) => {
  const r = await fetch(
    "https://firestx.booqable.com/api/4/products?page[size]=1",
    { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
  );
  res.json(await r.json());
});

clubRouter.get("/:id", getClubById);

export default clubRouter;
