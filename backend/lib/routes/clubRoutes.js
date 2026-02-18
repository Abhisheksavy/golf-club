"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clubController_1 = require("../controllers/clubController");
const auth_1 = require("../middlewares/auth");
const clubRouter = (0, express_1.Router)();
clubRouter.get("/", auth_1.authMiddleware, clubController_1.getClubs);
clubRouter.get("/available", auth_1.authMiddleware, clubController_1.getAvailableClubs);
clubRouter.get("/:id", clubController_1.getClubById);
exports.default = clubRouter;
//# sourceMappingURL=clubRoutes.js.map