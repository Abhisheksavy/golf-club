"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReservations = exports.createReservation = void 0;
const reservation_1 = require("../models/reservation");
const favouriteSets_1 = require("../models/favouriteSets");
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const clubController_1 = require("./clubController");
const createReservation = async (req, res) => {
    try {
        const { course, date, clubs, saveToBag } = req.body;
        if (!course || !date || !(clubs === null || clubs === void 0 ? void 0 : clubs.length)) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("Course, date, and clubs are required", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
            return;
        }
        let savedAsBag;
        if (saveToBag) {
            const bag = await favouriteSets_1.Favourite.create({
                user: req.userId,
                setName: `${course} - ${new Date(date).toLocaleDateString()}`,
                clubs,
            });
            savedAsBag = bag._id;
        }
        const reservation = await reservation_1.Reservation.create({
            user: req.userId,
            course,
            date,
            clubs,
            savedAsBag,
        });
        const enrichedClubs = await (0, clubController_1.fetchProductsByIds)(reservation.clubs);
        const result = Object.assign(Object.assign({}, reservation.toObject()), { clubs: enrichedClubs });
        res
            .status(http_status_codes_1.StatusCodes.CREATED)
            .json(response_1.Response.success("Reservation created successfully", result, http_status_codes_1.StatusCodes.CREATED));
    }
    catch (error) {
        console.error("createReservation error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.createReservation = createReservation;
const getReservations = async (req, res) => {
    try {
        const reservations = await reservation_1.Reservation.find({ user: req.userId }).sort({
            date: -1,
        });
        const allClubIds = [
            ...new Set(reservations.flatMap((r) => r.clubs)),
        ];
        const clubMap = new Map((await (0, clubController_1.fetchProductsByIds)(allClubIds)).map((c) => [c._id, c]));
        const enriched = reservations.map((r) => (Object.assign(Object.assign({}, r.toObject()), { clubs: r.clubs.map((id) => { var _a; return (_a = clubMap.get(id)) !== null && _a !== void 0 ? _a : id; }) })));
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Reservation get successfully", enriched, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getReservations error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getReservations = getReservations;
//# sourceMappingURL=reservationController.js.map