import jwt from "jsonwebtoken";
import type {
  Request,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: ExpressResponse,
  next: NextFunction
): void => {
  // Dev bypass — set SKIP_AUTH=true in .env to skip JWT verification
  // if (process.env.SKIP_AUTH === "true") {
  //   req.userId = process.env.DEV_USER_ID || "000000000000000000000001";
  //   next();
  //   return;
  // }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          Response.failure(
            "Authentication required",
            null,
            StatusCodes.UNAUTHORIZED
          )
        );

      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(
        Response.failure(
          "Invalid or expired token",
          null,
          StatusCodes.UNAUTHORIZED
        )
      );
  }
};
