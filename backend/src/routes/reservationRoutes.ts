import { Router } from "express";
import {
  createReservation,
  getReservations,
} from "../controllers/reservationController";

const reservationRouter = Router();

reservationRouter.post("/", createReservation);
reservationRouter.get("/", getReservations);

export default reservationRouter;
