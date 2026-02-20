"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableClubs = exports.getClubById = exports.getClubs = void 0;
exports.fetchAllBooqableProducts = fetchAllBooqableProducts;
exports.fetchProductsByIds = fetchProductsByIds;
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
function getClubCategory(tags) {
    if (tags.includes("driver"))
        return "driver";
    if (tags.includes("fairway-wood") || tags.includes("hybrid"))
        return "fairway-woods-hybrids";
    if (tags.includes("iron"))
        return "irons";
    if (tags.includes("wedge"))
        return "wedges";
    if (tags.includes("putter"))
        return "putter";
    return undefined;
}
function getShaftType(tags) {
    if (tags.includes("flexible"))
        return "flexible";
    if (tags.includes("stiff"))
        return "stiff";
    return undefined;
}
function getIronType(tags) {
    if (tags.includes("blades"))
        return "blades";
    if (tags.includes("cavity-back"))
        return "cavity-back";
    if (tags.includes("muscle-back"))
        return "muscle-back";
    return undefined;
}
function transformProduct(p) {
    var _a, _b, _c, _d;
    const tags = (_a = p.attributes.tag_list) !== null && _a !== void 0 ? _a : [];
    return {
        _id: p.id,
        booqableProductId: p.id,
        name: p.attributes.name,
        sku: (_b = p.attributes.sku) !== null && _b !== void 0 ? _b : undefined,
        image: (_c = p.attributes.photo_url) !== null && _c !== void 0 ? _c : undefined,
        description: (_d = p.attributes.description) !== null && _d !== void 0 ? _d : undefined,
        metadata: p.attributes,
        isActive: !p.attributes.archived,
        category: getClubCategory(tags),
        shaftType: getShaftType(tags),
        ironType: getIronType(tags),
    };
}
async function fetchPage(page, pageSize) {
    const url = new URL("https://firestx.booqable.com/api/4/products");
    url.searchParams.set("page[number]", String(page));
    url.searchParams.set("page[size]", String(pageSize));
    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
    });
    if (!res.ok)
        throw new Error(`Booqable API error: ${res.status}`);
    return res.json();
}
async function fetchAllBooqableProducts() {
    const pageSize = 100;
    const first = await fetchPage(1, pageSize);
    const totalPages = Math.ceil(first.meta.total_count / pageSize);
    if (totalPages <= 1)
        return first.data;
    const rest = await Promise.all(Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2, pageSize)));
    return [first.data, ...rest.map((p) => p.data)].flat();
}
async function fetchProductsByIds(ids) {
    const all = await fetchAllBooqableProducts();
    return all.filter((p) => ids.includes(p.id)).map(transformProduct);
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
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const clubs = filtered
            .slice((page - 1) * limit, page * limit)
            .map(transformProduct);
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
            .json(response_1.Response.success("Club fetch by Id", transformProduct(data), http_status_codes_1.StatusCodes.OK));
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
            const result = active.map((p) => (Object.assign(Object.assign({}, transformProduct(p)), { available: true, unavailabilityReason: null })));
            res.status(http_status_codes_1.StatusCodes.OK).json(response_1.Response.success("Available clubs fetched", result, http_status_codes_1.StatusCodes.OK));
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
            ? { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) }
            : null;
        if (!parsedDate) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response_1.Response.failure("Invalid date format", null, http_status_codes_1.StatusCodes.BAD_REQUEST));
            return;
        }
        const available = await Promise.all(active.map(async (p) => {
            const isAvailable = locationId
                ? await checkProductAvailableOnDate(p.id, locationId, parsedDate.year, parsedDate.month, parsedDate.day)
                : true;
            return Object.assign(Object.assign({}, transformProduct(p)), { available: isAvailable, unavailabilityReason: isAvailable ? null : "on-this-date" });
        }));
        res.status(http_status_codes_1.StatusCodes.OK).json(response_1.Response.success("Available clubs fetched", available, http_status_codes_1.StatusCodes.OK));
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