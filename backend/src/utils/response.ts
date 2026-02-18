import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export class Response<T = null> {
  readonly success: boolean;
  readonly status: string;
  readonly message: string;
  readonly data: T;
  readonly statusCode: number;

  private constructor(
    success: boolean,
    message: string,
    data: T,
    statusCode: number
  ) {
    this.success = success;
    this.status = success ? "success" : "failure"; // Set status based on success
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(
    message: string,
    data: T,
    statusCode: number = StatusCodes.OK
  ) {
    return new Response(true, message, data, statusCode);
  }

  static failure<T>(
    message: string,
    data: T,
    statusCode: number = StatusCodes.BAD_REQUEST
  ) {
    return new Response(false, message, data, statusCode);
  }
}

export const ResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    status: z.enum(["success", "failure"]),
    message: z.string(),
    data: dataSchema.optional(), // Changed from responseObject to data for consistency
    statusCode: z.number(),
  });
