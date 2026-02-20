import { Router } from "express";
import {
  requestMagicLink,
  verifyMagicLink,
  loginWithPassword,
} from "../controllers/authController";

const authRouter = Router();
authRouter.post("/requestMagicLink", requestMagicLink);
authRouter.post("/verify", verifyMagicLink);
authRouter.post("/login", loginWithPassword);
export default authRouter;
