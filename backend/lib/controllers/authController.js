"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMagicLink = exports.requestMagicLink = void 0;
const crypto_1 = __importDefault(require("crypto"));
const users_1 = require("../models/users");
const loginToken_1 = require("../models/loginToken");
// import sendMagicLinkEmail from "../services/emailService";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const requestMagicLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res
                .Status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("Email is required", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        let user = await users_1.USER.findOne({ email });
        if (!user) {
            user = await users_1.USER.create({ email });
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await loginToken_1.LoginToken.findOneAndUpdate({ email }, { token, expiresAt }, { upsert: true });
        const magicLink = `${process.env.CLIENT_URL}/verify?token=${token}`;
        console.log("magicLink", magicLink);
        // await sendMagicLinkEmail(email, magicLink);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Magic link sent successfully", magicLink, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error(error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.requestMagicLink = requestMagicLink;
const verifyMagicLink = async (req, res) => {
    try {
        const { token } = req.query;
        console.log("token", token);
        const storedToken = await loginToken_1.LoginToken.findOne({ token });
        console.log("storedToken", storedToken);
        if (!storedToken) {
            return res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("Invalid or expired token", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        const user = await users_1.USER.findOne({ email: storedToken.email });
        if (user) {
            user.isVerified = true;
            await user.save();
            const jwtToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });
            await loginToken_1.LoginToken.deleteOne({ token });
            return res.status(http_status_codes_1.StatusCodes.OK).json(response_1.Response.success("Login successful", {
                token: jwtToken,
                user: {
                    id: user._id,
                    email: user.email,
                },
            }, http_status_codes_1.StatusCodes.OK));
        }
    }
    catch (error) {
        console.error(error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.verifyMagicLink = verifyMagicLink;
//# sourceMappingURL=authController.js.map