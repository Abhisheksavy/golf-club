"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clubController_1 = require("../controllers/clubController");
const clubRouter = (0, express_1.Router)();
clubRouter.get("/", clubController_1.getClubs);
clubRouter.get("/available", clubController_1.getAvailableClubs);
clubRouter.get("/collections", clubController_1.getCollectionsHandler);
// Temporary: inspect a single product to see product_group_id field
clubRouter.get("/debug/collections", async (_req, res) => {
    const r = await fetch("https://firestx.booqable.com/api/4/products?page[size]=1", { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
    res.json(await r.json());
});
clubRouter.get("/:id", clubController_1.getClubById);
exports.default = clubRouter;
//# sourceMappingURL=clubRoutes.js.map