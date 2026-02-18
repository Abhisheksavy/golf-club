"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const clubRoutes_1 = __importDefault(require("./clubRoutes"));
const favouriteRoutes_1 = __importDefault(require("./favouriteRoutes"));
const reservationRoutes_1 = __importDefault(require("./reservationRoutes"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use("/auth", authRoutes_1.default);
router.use("/clubs", auth_1.authMiddleware, clubRoutes_1.default);
router.use("/favourites", auth_1.authMiddleware, favouriteRoutes_1.default);
router.use("/reservations", auth_1.authMiddleware, reservationRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map