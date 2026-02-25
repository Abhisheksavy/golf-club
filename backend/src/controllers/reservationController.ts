import type { Response as ExpressResponse } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { Reservation } from "../models/reservation";
import { Favourite } from "../models/favouriteSets";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";
import { fetchProductsByIds } from "./clubController";

export const createReservation = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const { course, date, clubs, saveToBag } = req.body;

    if (!course || !date || !clubs?.length) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          Response.failure(
            "Course, date, and clubs are required",
            null,
            StatusCodes.BAD_REQUEST
          )
        );

      return;
    }

    let savedAsBag;

    if (saveToBag) {
      const bag = await Favourite.create({
        user: req.userId,
        setName: `${course} - ${new Date(date).toLocaleDateString()}`,
        clubs,
      });
      savedAsBag = bag._id;
    }

    const reservation = await Reservation.create({
      user: req.userId,
      course,
      date,
      clubs,
      savedAsBag,
    });

    const enrichedClubs = await fetchProductsByIds(
      reservation.clubs as string[]
    );
    const result = { ...reservation.toObject(), clubs: enrichedClubs };

    res
      .status(StatusCodes.CREATED)
      .json(
        Response.success(
          "Reservation created successfully",
          result,
          StatusCodes.CREATED
        )
      );
  } catch (error) {
    console.error("createReservation error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure(
          "Server error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

export const getReservations = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const total = await Reservation.countDocuments({ user: req.userId });

    const reservations = await Reservation.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const allClubIds = [
      ...new Set(reservations.flatMap((r) => r.clubs as string[])),
    ];
    const clubMap = new Map(
      (await fetchProductsByIds(allClubIds)).map((c) => [c._id, c])
    );

    const enriched = reservations.map((r) => ({
      ...r.toObject(),
      clubs: (r.clubs as string[]).map((id) => clubMap.get(id) ?? id),
    }));

    const totalPages = Math.ceil(total / limit);

    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Reservation get successfully",
          { reservations: enriched, total, totalPages, page, limit },
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("getReservations error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure(
          "Server error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};
