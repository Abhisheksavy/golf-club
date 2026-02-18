import type { Response as ExpressResponse } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { Favourite } from "../models/favouriteSets";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";
import { fetchProductsByIds } from "./clubController";

async function enrichFavourite(fav: InstanceType<typeof Favourite>) {
  const clubs = await fetchProductsByIds(fav.clubs as string[]);
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

    const favourite = await Favourite.create({
      user: req.userId,
      setName,
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
    const favourites = await Favourite.find({ user: req.userId }).sort({ updatedAt: -1 });

    const allClubIds = [...new Set(favourites.flatMap((f) => f.clubs as string[]))];
    const clubMap = new Map(
      (await fetchProductsByIds(allClubIds)).map((c) => [c._id, c])
    );

    const enriched = favourites.map((f) => ({
      ...f.toObject(),
      clubs: (f.clubs as string[]).map((id) => clubMap.get(id) ?? id),
    }));

    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Favourite fetched successfully",
          enriched,
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
    });

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

    if (setName !== undefined) update.setName = setName;
    if (clubs !== undefined) update.clubs = clubs;

    const favourite = await Favourite.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
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
    const favourite = await Favourite.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

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
        Response.success("Favourite bag deleted", favourite, StatusCodes.OK)
      );
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
