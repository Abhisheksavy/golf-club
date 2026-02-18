"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res
                .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .json(response_1.Response.failure("Authentication required", null, http_status_codes_1.StatusCodes.UNAUTHORIZED));
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json(response_1.Response.failure("Invalid or expired token", null, http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map