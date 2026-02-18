"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const reservationRouter = (0, express_1.Router)();
reservationRouter.post("/", reservationController_1.createReservation);
reservationRouter.get("/", reservationController_1.getReservations);
exports.default = reservationRouter;
//# sourceMappingURL=reservationRoutes.js.map