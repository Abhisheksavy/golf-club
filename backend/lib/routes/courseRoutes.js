"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const courseRouter = (0, express_1.Router)();
courseRouter.get("/", courseController_1.getCourses);
courseRouter.get("/:locationId/available-dates", courseController_1.getAvailableDates);
exports.default = courseRouter;
//# sourceMappingURL=courseRoutes.js.map