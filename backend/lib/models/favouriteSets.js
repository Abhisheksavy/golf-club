"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favourite = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const favoriteSetSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    setName: {
        type: String,
        required: true,
        trim: true,
    },
    clubs: [{ type: String }],
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
exports.Favourite = mongoose_1.default.model("FAVOURITE", favoriteSetSchema);
//# sourceMappingURL=favouriteSets.js.map