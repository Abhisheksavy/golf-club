import crypto from "crypto";
import bcrypt from "bcrypt";
import { USER } from "../models/users";
import { LoginToken } from "../models/loginToken";
// import sendMagicLinkEmail from "../services/emailService";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";

export const loginWithPassword = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          Response.failure("Email and password are required", null, StatusCodes.BAD_REQUEST)
        );
    }

    let user = await USER.findOne({ email });

    if (user && user.password) {
      // Existing password account — verify credentials
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(Response.failure("Incorrect password", null, StatusCodes.UNAUTHORIZED));
      }
    } else if (user && !user.password) {
      // Account exists but was created via magic link — reject
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          Response.failure(
            "This email uses magic link login. Use the Email Link tab.",
            null,
            StatusCodes.BAD_REQUEST
          )
        );
    } else {
      // New user — auto-register with hashed password
      const hash = await bcrypt.hash(password, 10);
      user = await USER.create({ email, password: hash, isVerified: true });
    }

    const jwtToken = jwt.sign({ userId: user!._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.status(StatusCodes.OK).json(
      Response.success(
        "Login successful",
        {
          token: jwtToken,
          user: { id: user!._id, email: user!.email },
        },
        StatusCodes.OK
      )
    );
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure("Server error", null, StatusCodes.INTERNAL_SERVER_ERROR)
      );
  }
};

export const requestMagicLink = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .Status(StatusCodes.BAD_REQUEST)

        .json(
          Response.failure("Email is required", null, StatusCodes.BAD_REQUEST)
        );
    }

    let user = await USER.findOne({ email });

    if (!user) {
      user = await USER.create({ email });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await LoginToken.findOneAndUpdate(
      { email },
      { token, expiresAt },
      { upsert: true }
    );

    const magicLink = `${process.env.CLIENT_URL}/verify?token=${token}`;
    console.log("magicLink", magicLink);
    // await sendMagicLinkEmail(email, magicLink);
    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Magic link sent successfully",
          magicLink,
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure(
          "Server error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

export const verifyMagicLink = async (req: any, res: any) => {
  try {
    const { token } = req.query;
    

    const storedToken = await LoginToken.findOne({ token });
    console.log("storedToken", storedToken);

    if (!storedToken) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          Response.failure(
            "Invalid or expired token",
            null,
            StatusCodes.BAD_REQUEST
          )
        );
    }

    const user = await USER.findOne({ email: storedToken.email });
    if (user) {
      user.isVerified = true;
      await user.save();

      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      await LoginToken.deleteOne({ token });
      return res.status(StatusCodes.OK).json(
        Response.success(
          "Login successful",
          {
            token: jwtToken,
            user: {
              id: user._id,
              email: user.email,
            },
          },
          StatusCodes.OK
        )
      );
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure(
          "Server error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};
