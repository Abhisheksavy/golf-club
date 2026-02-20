"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletionLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const deletionLogSchema = new mongoose_1.default.Schema({
    entityType: {
        type: String,
        required: true,
        trim: true,
    },
    entityId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    entitySnapshot: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
    deletedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: false });
exports.DeletionLog = mongoose_1.default.model("DELETION_LOG", deletionLogSchema);
//# sourceMappingURL=deletionLog.js.map