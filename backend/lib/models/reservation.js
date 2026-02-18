"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reservationSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        index: true,
    },
    course: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    clubs: [{ type: String }],
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "confirmed",
    },
    savedAsBag: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "FAVOURITE",
    },
}, { timestamps: true });
exports.Reservation = mongoose_1.default.model("Reservation", reservationSchema);
//# sourceMappingURL=reservation.js.map