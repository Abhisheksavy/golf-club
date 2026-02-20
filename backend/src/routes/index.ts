import { Router } from "express";
import authRouter from "./authRoutes";
import clubRouter from "./clubRoutes";
import favouriteRouter from "./favouriteRoutes";
import reservationRouter from "./reservationRoutes";
import courseRouter from "./courseRoutes";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.use("/auth", authRouter);
router.use("/courses", courseRouter); // public — no auth required
router.use("/clubs", clubRouter); // public — club catalogue requires no auth
router.use("/favourites", authMiddleware, favouriteRouter);
router.use("/reservations", authMiddleware, reservationRouter);

export default router;
