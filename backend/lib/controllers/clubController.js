"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableClubs = exports.getClubById = exports.getClubs = void 0;
exports.fetchProductsByIds = fetchProductsByIds;
const http_status_codes_1 = require("http-status-codes");
const response_1 = require("../utils/response");
function transformProduct(p) {
    var _a, _b, _c;
    return {
        _id: p.id,
        booqableProductId: p.id,
        name: p.attributes.name,
        sku: (_a = p.attributes.sku) !== null && _a !== void 0 ? _a : undefined,
        image: (_b = p.attributes.photo_url) !== null && _b !== void 0 ? _b : undefined,
        description: (_c = p.attributes.description) !== null && _c !== void 0 ? _c : undefined,
        metadata: p.attributes,
        isActive: !p.attributes.archived,
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
const getAvailableClubs = async (req, res) => {
    try {
        const allProducts = await fetchAllBooqableProducts();
        const active = allProducts.filter((p) => !p.attributes.archived);
        const { course, date } = req.query;
        const seed = `${course}-${date}`;
        const available = active.map((p) => {
            const hash = simpleHash(`${seed}-${p.id}`);
            return Object.assign(Object.assign({}, transformProduct(p)), { available: hash % 5 !== 0 });
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
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash);
}
//# sourceMappingURL=clubController.js.map