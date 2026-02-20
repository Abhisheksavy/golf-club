"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableDates = exports.getCourses = void 0;
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const getCourses = async (_req, res) => {
    try {
        const apiRes = await fetch("https://firestx.booqable.com/api/4/locations", {
            headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
        });
        if (!apiRes.ok) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_GATEWAY)
                .json(response_1.Response.failure("Failed to fetch courses from Booqable", null, http_status_codes_1.StatusCodes.BAD_GATEWAY));
            return;
        }
        const { data } = (await apiRes.json());
        const courses = data.map((loc) => ({
            id: loc.id,
            name: loc.attributes.name,
            address: [
                loc.attributes.address_line_1,
                loc.attributes.city,
                loc.attributes.country,
            ]
                .filter(Boolean)
                .join(", ") || undefined,
        }));
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Courses fetched successfully", courses, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getCourses error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getCourses = getCourses;
const getAvailableDates = async (req, res) => {
    var _a;
    // const locationId = String(req.params.locationId);
    const year = typeof req.query.year === "string" ? req.query.year : undefined;
    const month = typeof req.query.month === "string" ? req.query.month : undefined;
    if (!year || !month) {
        res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json(response_1.Response.failure("year and month are required", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
        return;
    }
    try {
        // Booqable requires subject_id + subject_type=item — fetch the first active product
        const productsRes = await fetch("https://firestx.booqable.com/api/4/products?filter[archived]=false&page[size]=1", { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
        if (!productsRes.ok) {
            const errBody = await productsRes.text();
            console.error("Booqable products error:", productsRes.status, errBody);
            res
                .status(http_status_codes_1.StatusCodes.BAD_GATEWAY)
                .json(response_1.Response.failure("Failed to fetch products from Booqable", null, http_status_codes_1.StatusCodes.BAD_GATEWAY));
            return;
        }
        const productsJson = (await productsRes.json());
        const firstProduct = productsJson.data[0];
        if (!firstProduct) {
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json(response_1.Response.success("Available dates fetched", { dates: [] }, http_status_codes_1.StatusCodes.OK));
            return;
        }
        // Note: location_id is intentionally omitted — club stock is not location-specific
        // in this Booqable setup. We check product availability globally.
        const qs = [
            `filter[subject_type]=item`,
            `filter[subject_id]=${encodeURIComponent(firstProduct.id)}`,
            `filter[year]=${encodeURIComponent(year)}`,
            `filter[month]=${encodeURIComponent(month)}`,
        ].join("&");
        const apiRes = await fetch(`https://firestx.booqable.com/api/4/availabilities?${qs}`, { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
        if (!apiRes.ok) {
            const errBody = await apiRes.text();
            console.error("Booqable availabilities error:", apiRes.status, errBody);
            res
                .status(http_status_codes_1.StatusCodes.BAD_GATEWAY)
                .json(response_1.Response.failure("Failed to fetch available dates", null, http_status_codes_1.StatusCodes.BAD_GATEWAY));
            return;
        }
        const json = (await apiRes.json());
        const records = (_a = json.data) !== null && _a !== void 0 ? _a : [];
        const dates = records
            .filter((r) => r.attributes.available === true)
            .map((r) => r.attributes.date);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Available dates fetched", { dates }, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getAvailableDates error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getAvailableDates = getAvailableDates;
//# sourceMappingURL=courseController.js.map