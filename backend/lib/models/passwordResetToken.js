"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const passwordResetTokenSchema = new mongoose_1.default.Schema({
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
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.PasswordResetToken = mongoose_1.default.model("PasswordResetToken", passwordResetTokenSchema);
//# sourceMappingURL=passwordResetToken.js.map