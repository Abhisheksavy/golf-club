"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableClubs = exports.getClubById = exports.getClubs = void 0;
exports.fetchAllBooqableProducts = fetchAllBooqableProducts;
exports.fetchProductsByIds = fetchProductsByIds;
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
const helper_1 = require("../utils/helper");
async function fetchAllBooqableProducts() {
    const pageSize = 100;
    const first = await (0, helper_1.fetchPage)(1, pageSize);
    const totalPages = Math.ceil(first.meta.total_count / pageSize);
    if (totalPages <= 1)
        return first.data;
    const rest = await Promise.all(Array.from({ length: totalPages - 1 }, (_, i) => (0, helper_1.fetchPage)(i + 2, pageSize)));
    return [first.data, ...rest.map((p) => p.data)].flat();
}
async function fetchProductsByIds(ids) {
    const all = await fetchAllBooqableProducts();
    const filtered = all.filter((p) => ids.includes(p.id));
    return filtered
        .sort((a, b) => {
        var _a, _b;
        return new Date((_a = b.attributes.created_at) !== null && _a !== void 0 ? _a : "").getTime() -
            new Date((_b = a.attributes.created_at) !== null && _b !== void 0 ? _b : "").getTime();
    })
        .map(helper_1.transformProduct);
}
const getClubs = async (req, res) => {
    try {
        const { brand, category, search, isActive: isActiveParam, archived: archivedParam, } = req.query;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        let filtered = await fetchAllBooqableProducts();
        if (archivedParam === "true" || isActiveParam === "false") {
            filtered = filtered.filter((p) => p.attributes.archived);
        }
        else if (archivedParam !== "all" && isActiveParam !== "all") {
            filtered = filtered.filter((p) => !p.attributes.archived);
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((p) => p.attributes.name.toLowerCase().includes(q));
        }
        if (brand) {
            filtered = filtered.filter((p) => p.attributes.brand === brand);
        }
        if (category) {
            filtered = filtered.filter((p) => p.attributes.category === category);
        }
        filtered = filtered.sort((a, b) => {
            var _a, _b;
            const dateA = new Date(((_a = a.attributes.created_at) !== null && _a !== void 0 ? _a : "")).getTime();
            const dateB = new Date(((_b = b.attributes.created_at) !== null && _b !== void 0 ? _b : "")).getTime();
            return dateB - dateA;
        });
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const clubs = filtered
            .slice((page - 1) * limit, page * limit)
            .map(helper_1.transformProduct);
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("clubs fetched successfully", { clubs, total, totalPages, page, limit }, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getClubs error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getClubs = getClubs;
const getClubById = async (req, res) => {
    try {
        const apiRes = await fetch(`https://firestx.booqable.com/api/4/products/${req.params.id}`, { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
        if (!apiRes.ok) {
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json(response_1.Response.success("Club not found", null, http_status_codes_1.StatusCodes.OK));
            return;
        }
        const { data } = (await apiRes.json());
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Club fetch by Id", (0, helper_1.transformProduct)(data), http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getClubById error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getClubById = getClubById;
async function fetchLocations() {
    const res = await fetch("https://firestx.booqable.com/api/4/locations", {
        headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
    });
    if (!res.ok)
        throw new Error(`Booqable locations API error: ${res.status}`);
    const json = (await res.json());
    return json.data;
}
async function checkProductAvailableOnDate(productId, locationId, year, month, day) {
    try {
        const url = new URL("https://firestx.booqable.com/api/4/availabilities");
        url.searchParams.set("filter[subject_type]", "item");
        url.searchParams.set("filter[subject_id]", productId);
        url.searchParams.set("filter[location_id]", locationId);
        url.searchParams.set("filter[year]", String(year));
        url.searchParams.set("filter[month]", String(month));
        url.searchParams.set("filter[day]", String(day));
        const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
        });
        if (!res.ok)
            return true; // graceful degradation on error
        const json = (await res.json());
        if (!json.data || json.data.length === 0)
            return true;
        return json.data[0].attributes.available;
    }
    catch (_a) {
        return true; // graceful degradation
    }
}
const getAvailableClubs = async (req, res) => {
    var _a;
    try {
        const { course, date } = req.query;
        const allProducts = await fetchAllBooqableProducts();
        const active = allProducts.filter((p) => !p.attributes.archived);
        // Course-only mode (no date): all active products are available.
        // Booqable products are bulk/non-trackable so there are no per-location
        // stock item records — all clubs are considered present at the course.
        if (!date) {
            const result = active
                .sort((a, b) => {
                var _a, _b;
                return new Date((_a = b.attributes.created_at) !== null && _a !== void 0 ? _a : "").getTime() -
                    new Date((_b = a.attributes.created_at) !== null && _b !== void 0 ? _b : "").getTime();
            })
                .map((p) => (Object.assign(Object.assign({}, (0, helper_1.transformProduct)(p)), { available: true, unavailabilityReason: null })));
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json(response_1.Response.success("Available clubs fetched", result, http_status_codes_1.StatusCodes.OK));
            return;
        }
        // Course + date mode: check availability per product on the requested date.
        let locationId = null;
        if (course) {
            const locations = await fetchLocations();
            const match = locations.find((l) => l.attributes.name.toLowerCase() === course.toLowerCase());
            locationId = (_a = match === null || match === void 0 ? void 0 : match.id) !== null && _a !== void 0 ? _a : null;
        }
        const parts = date.split("-");
        const parsedDate = parts.length === 3
            ? {
                year: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10),
                day: parseInt(parts[2], 10),
            }
            : null;
        if (!parsedDate) {
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json(response_1.Response.failure("Invalid date format", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
            return;
        }
        const available = (await Promise.all(active.map(async (p) => {
            var _a;
            const isAvailable = locationId
                ? await checkProductAvailableOnDate(p.id, locationId, parsedDate.year, parsedDate.month, parsedDate.day)
                : true;
            return Object.assign(Object.assign({}, (0, helper_1.transformProduct)(p)), { available: isAvailable, unavailabilityReason: isAvailable
                    ? null
                    : "on-this-date", _createdAt: (_a = p.attributes.created_at) !== null && _a !== void 0 ? _a : "" });
        })))
            .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
            .map((_a) => {
            var { _createdAt: _ } = _a, rest = __rest(_a, ["_createdAt"]);
            return rest;
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json(response_1.Response.success("Available clubs fetched", available, http_status_codes_1.StatusCodes.OK));
    }
    catch (error) {
        console.error("getAvailableClubs error:", error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response_1.Response.failure("Server error", null, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
exports.getAvailableClubs = getAvailableClubs;
//# sourceMappingURL=clubController.js.map