"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const loginTokenSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });
// Auto delete expired tokens
loginTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.LoginToken = mongoose_1.default.model("LoginToken", loginTokenSchema);
//# sourceMappingURL=loginToken.js.map