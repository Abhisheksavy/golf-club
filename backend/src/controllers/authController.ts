import crypto from "crypto";
import { USER } from "../models/users";
import { LoginToken } from "../models/loginToken";
// import sendMagicLinkEmail from "../services/emailService";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";

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
