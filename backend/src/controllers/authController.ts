import crypto from "crypto";
import { USER } from "../models/users";
import { LoginToken } from "../models/loginToken";
import sendMagicLinkEmail from "../services/emailService";
import jwt from "jsonwebtoken";

export const requestMagicLink = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await USER.findOne({ email });

    if (!user) {
      user = await USER.create({ email });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await LoginToken.create({
      email,
      token,
      expiresAt,
    });

    const magicLink = `${process.env.CLIENT_URL}/verify?token=${token}`;

    await sendMagicLinkEmail(email, magicLink);

    res.json({ message: "Magic link sent successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", success: false, status: 500 });
  }
};

export const verifyMagicLink = async (req: any, res: any) => {
  try {
    const { token } = req.query;

    const storedToken = await LoginToken.findOne({ token });

    if (!storedToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await USER.findOne({ email: storedToken.email });
    if (user) {
      user.isVerified = true;
      await user.save();

      const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      await LoginToken.deleteOne({ token });

      res.json({
        message: "Login successful",
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
