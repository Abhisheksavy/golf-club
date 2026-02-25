import type { Response as ExpressResponse } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { Favourite } from "../models/favouriteSets";
import { DeletionLog } from "../models/deletionLog";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";
import { fetchProductsByIds } from "./clubController";

async function enrichFavourite(fav: InstanceType<typeof Favourite>) {
  const reversedIds = [...(fav.clubs as string[])].reverse();
  const clubs = await fetchProductsByIds(reversedIds);
  return { ...fav.toObject(), clubs };
}

export const createFavourite = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const { setName, clubs } = req.body;

    if (!setName) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          Response.failure(
            "Bag name is required",
            null,
            StatusCodes.BAD_REQUEST
          )
        );
      return;
    }

    const trimmedName = setName.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          Response.failure(
            "Set name must be between 1 and 50 characters",
            null,
            StatusCodes.BAD_REQUEST
          )
        );
      return;
    }

    const existing = await Favourite.findOne({
      user: req.userId,
      setName: trimmedName,
      isDeleted: { $ne: true },
    });
    if (existing) {
      res
        .status(StatusCodes.CONFLICT)
        .json(
          Response.failure(
            "A bag with this name already exists",
            null,
            StatusCodes.CONFLICT
          )
        );
      return;
    }

    const favourite = await Favourite.create({
      user: req.userId,
      setName: trimmedName,
      clubs: clubs || [],
    });

    res
      .status(StatusCodes.CREATED)
      .json(
        Response.success(
          "Favorite Bag created!!",
          await enrichFavourite(favourite),
          StatusCodes.CREATED
        )
      );
  } catch (error) {
    console.error("createFavourite error:", error);
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

export const getFavourites = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const total = await Favourite.countDocuments({
      user: req.userId,
      isDeleted: { $ne: true },
    });

    const favourites = await Favourite.find({
      user: req.userId,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const allClubIds = [
      ...new Set(favourites.flatMap((f) => f.clubs as string[])),
    ];
    const clubMap = new Map(
      (await fetchProductsByIds(allClubIds)).map((c) => [c._id, c])
    );

    const enriched = favourites.map((f) => ({
      ...f.toObject(),
      clubs: [...(f.clubs as string[])]
        .reverse()
        .map((id) => clubMap.get(id) ?? id),
    }));

    const totalPages = Math.ceil(total / limit);

    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Favourite fetched successfully",
          { favourites: enriched, total, totalPages, page, limit },
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("getFavourites error:", error);
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

export const getFavouriteById = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const favourite = await Favourite.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    if (!favourite) {
      res
        .status(StatusCodes.OK)
        .json(
          Response.failure("Favourite bag not found", null, StatusCodes.OK)
        );

      return;
    }

    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Favourite fetched successfully",
          await enrichFavourite(favourite),
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("getFavouriteById error:", error);
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

export const updateFavourite = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const { setName, clubs } = req.body;
    const update: Record<string, unknown> = {};

    if (setName !== undefined) {
      const trimmedName = setName.trim();
      if (trimmedName.length < 1 || trimmedName.length > 50) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            Response.failure(
              "Set name must be between 1 and 50 characters",
              null,
              StatusCodes.BAD_REQUEST
            )
          );
        return;
      }
      const existing = await Favourite.findOne({
        user: req.userId,
        setName: trimmedName,
        isDeleted: { $ne: true },
        _id: { $ne: req.params.id },
      });
      if (existing) {
        res
          .status(StatusCodes.CONFLICT)
          .json(
            Response.failure(
              "A bag with this name already exists",
              null,
              StatusCodes.CONFLICT
            )
          );
        return;
      }
      update.setName = trimmedName;
    }
    if (clubs !== undefined) update.clubs = clubs;

    const favourite = await Favourite.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, isDeleted: { $ne: true } },
      update,
      { new: true }
    ).sort({ createdAt: -1 });

    if (!favourite) {
      res
        .status(StatusCodes.OK)
        .json(
          Response.failure("Favourite bag not found", null, StatusCodes.OK)
        );

      return;
    }

    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Favourite fetched successfully",
          await enrichFavourite(favourite),
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("updateFavourite error:", error);
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

export const deleteFavourite = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const deletedAt = new Date();

    const favourite = await Favourite.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt },
      { new: true }
    );

    if (!favourite) {
      res
        .status(StatusCodes.OK)
        .json(
          Response.failure("Favourite bag not found", null, StatusCodes.OK)
        );
      return;
    }

    // Write deletion log
    await DeletionLog.create({
      entityType: "FavouriteSet",
      entityId: favourite._id,
      entitySnapshot: favourite.toObject(),
      deletedBy: req.userId,
      deletedAt,
    });

    res
      .status(StatusCodes.OK)
      .json(Response.success("Favourite bag deleted", null, StatusCodes.OK));
  } catch (error) {
    console.error("deleteFavourite error:", error);
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
