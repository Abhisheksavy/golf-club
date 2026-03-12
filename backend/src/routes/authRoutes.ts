import { Router } from "express";
import {
  requestMagicLink,
  verifyMagicLink,
  loginWithPassword,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";

const authRouter = Router();
authRouter.post("/requestMagicLink", requestMagicLink);
authRouter.post("/verify", verifyMagicLink);
authRouter.post("/login", loginWithPassword);
authRouter.post("/forgot-password", requestPasswordReset);
authRouter.post("/reset-password", resetPassword);
export default authRouter;
