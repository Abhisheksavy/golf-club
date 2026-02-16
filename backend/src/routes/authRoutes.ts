import { Router } from "express";
import {
  requestMagicLink,
  verifyMagicLink,
} from "../controllers/authController";

const authRouter = Router();
authRouter.post("/requestMagicLink", requestMagicLink);
authRouter.post("/verify", verifyMagicLink);
export default authRouter;
