"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authRouter = (0, express_1.Router)();
authRouter.post("/requestMagicLink", authController_1.requestMagicLink);
authRouter.post("/verify", authController_1.verifyMagicLink);
exports.default = authRouter;
//# sourceMappingURL=authRoutes.js.map