"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMagicLink = exports.requestMagicLink = exports.loginWithPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = require("../models/users");
const loginToken_1 = require("../models/loginToken");
// import sendMagicLinkEmail from "../services/emailService";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("Email and password are required", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        let user = await users_1.USER.findOne({ email });
        if (user && user.password) {
            // Existing password account — verify credentials
            const match = await bcrypt_1.default.compare(password, user.password);
            if (!match) {
                return res
                    .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                    .json(response_1.Response.failure("Incorrect password", null, http_status_codes_1.StatusCodes.UNAUTHORIZED));
            }
        }
        else if (user && !user.password) {
            // Account exists but was created via magic link — reject
            return res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("This email uses magic link login. Use the Email Link tab.", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        else {
            // New user — auto-register with hashed password
            const hash = await bcrypt_1.default.hash(password, 10);
            user = await users_1.USER.create({ email, password: hash, isVerified: true });
        }
        const jwtToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.status(http_status_codes_1.StatusCodes.OK).json(response_1.Response.success("Login successful", {
            token: jwtToken,
            user: { id: user._id, email: user.email },
        }, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error(error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.loginWithPassword = loginWithPassword;
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