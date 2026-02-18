import { Router } from "express";
import authRouter from "./authRoutes";
import clubRouter from "./clubRoutes";
import favouriteRouter from "./favouriteRoutes";
import reservationRouter from "./reservationRoutes";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.use("/auth", authRouter);
router.use("/clubs", authMiddleware, clubRouter);
router.use("/favourites", authMiddleware, favouriteRouter);
router.use("/reservations", authMiddleware, reservationRouter);

export default router;
