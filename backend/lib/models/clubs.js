"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLUB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const clubSchema = new mongoose_1.default.Schema({
    booqableProductId: { type: String, required: true, unique: true, index: true }
}, { timestamps: true });
exports.CLUB = mongoose_1.default.model("CLUB", clubSchema);
//# sourceMappingURL=clubs.js.map