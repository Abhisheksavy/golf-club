"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: false,
    },
}, { timestamps: true });
exports.USER = mongoose_1.default.model("USER", userSchema);
//# sourceMappingURL=users.js.map