"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favouriteController_1 = require("../controllers/favouriteController");
const favouriteRouter = (0, express_1.Router)();
favouriteRouter.post("/", favouriteController_1.createFavourite);
favouriteRouter.get("/", favouriteController_1.getFavourites);
favouriteRouter.get("/:id", favouriteController_1.getFavouriteById);
favouriteRouter.put("/:id", favouriteController_1.updateFavourite);
favouriteRouter.delete("/:id", favouriteController_1.deleteFavourite);
exports.default = favouriteRouter;
//# sourceMappingURL=favouriteRoutes.js.map