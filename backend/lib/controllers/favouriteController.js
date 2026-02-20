"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFavourite = exports.updateFavourite = exports.getFavouriteById = exports.getFavourites = exports.createFavourite = void 0;
const favouriteSets_1 = require("../models/favouriteSets");
const deletionLog_1 = require("../models/deletionLog");
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const clubController_1 = require("./clubController");
async function enrichFavourite(fav) {
    const clubs = await (0, clubController_1.fetchProductsByIds)(fav.clubs);
    return Object.assign(Object.assign({}, fav.toObject()), { clubs });
}
const createFavourite = async (req, res) => {
    try {
        const { setName, clubs } = req.body;
        if (!setName) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("Bag name is required", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
            return;
        }
        const favourite = await favouriteSets_1.Favourite.create({
            user: req.userId,
            setName,
            clubs: clubs || [],
        });
        res
            .status(http_status_codes_1.StatusCodes.CREATED)
            .json(response_1.Response.success("Favorite Bag created!!", await enrichFavourite(favourite), http_status_codes_1.StatusCodes.CREATED));
    }
    catch (error) {
        console.error("createFavourite error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.createFavourite = createFavourite;
const getFavourites = async (req, res) => {
    try {
        console.log("req", req.userId);
        const favourites = await favouriteSets_1.Favourite.find({
            user: req.userId,
            isDeleted: { $ne: true },
        }).sort({ updatedAt: -1 });
        const allClubIds = [
            ...new Set(favourites.flatMap((f) => f.clubs)),
        ];
        const clubMap = new Map((await (0, clubController_1.fetchProductsByIds)(allClubIds)).map((c) => [c._id, c]));
        const enriched = favourites.map((f) => (Object.assign(Object.assign({}, f.toObject()), { clubs: f.clubs.map((id) => { var _a; return (_a = clubMap.get(id)) !== null && _a !== void 0 ? _a : id; }) })));
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Favourite fetched successfully", enriched, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getFavourites error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getFavourites = getFavourites;
const getFavouriteById = async (req, res) => {
    try {
        const favourite = await favouriteSets_1.Favourite.findOne({
            _id: req.params.id,
            user: req.userId,
            isDeleted: { $ne: true },
        });
        if (!favourite) {
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json(response_1.Response.failure("Favourite bag not found", null, http_status_codes_1.StatusCodes.OK));
            return;
        }
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Favourite fetched successfully", await enrichFavourite(favourite), http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getFavouriteById error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getFavouriteById = getFavouriteById;
const updateFavourite = async (req, res) => {
    try {
        const { setName, clubs } = req.body;
        const update = {};
        if (setName !== undefined)
            update.setName = setName;
        if (clubs !== undefined)
            update.clubs = clubs;
        const favourite = await favouriteSets_1.Favourite.findOneAndUpdate({ _id: req.params.id, user: req.userId, isDeleted: { $ne: true } }, update, { new: true });
        if (!favourite) {
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json(response_1.Response.failure("Favourite bag not found", null, http_status_codes_1.StatusCodes.OK));
            return;
        }
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Favourite fetched successfully", await enrichFavourite(favourite), http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("updateFavourite error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.updateFavourite = updateFavourite;
const deleteFavourite = async (req, res) => {
    try {
        const deletedAt = new Date();
        const favourite = await favouriteSets_1.Favourite.findOneAndUpdate({ _id: req.params.id, user: req.userId, isDeleted: { $ne: true } }, { isDeleted: true, deletedAt }, { new: true });
        if (!favourite) {
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json(response_1.Response.failure("Favourite bag not found", null, http_status_codes_1.StatusCodes.OK));
            return;
        }
        // Write deletion log
        await deletionLog_1.DeletionLog.create({
            entityType: "FavouriteSet",
            entityId: favourite._id,
            entitySnapshot: favourite.toObject(),
            deletedBy: req.userId,
            deletedAt,
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Favourite bag deleted", null, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("deleteFavourite error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.deleteFavourite = deleteFavourite;
//# sourceMappingURL=favouriteController.js.map