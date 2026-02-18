"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSchema = exports.Response = void 0;
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
class Response {
    constructor(success, message, data, statusCode) {
        this.success = success;
        this.status = success ? "success" : "failure"; // Set status based on success
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }
    static success(message, data, statusCode = http_status_codes_1.StatusCodes.OK) {
        return new Response(true, message, data, statusCode);
    }
    static failure(message, data, statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST) {
        return new Response(false, message, data, statusCode);
    }
}
exports.Response = Response;
const ResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    status: zod_1.z.enum(["success", "failure"]),
    message: zod_1.z.string(),
    data: dataSchema.optional(), // Changed from responseObject to data for consistency
    statusCode: zod_1.z.number(),
});
exports.ResponseSchema = ResponseSchema;
//# sourceMappingURL=response.js.map