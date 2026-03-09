"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichFavourite = enrichFavourite;
exports.getClubCategory = getClubCategory;
exports.getShaftType = getShaftType;
exports.getIronType = getIronType;
exports.buildCategoryMap = buildCategoryMap;
exports.transformProduct = transformProduct;
exports.fetchPage = fetchPage;
const clubController_1 = require("../controllers/clubController");
async function enrichFavourite(fav) {
    const reversedIds = [...fav.clubs].reverse();
    const clubs = await (0, clubController_1.fetchProductsByIds)(reversedIds);
    return Object.assign(Object.assign({}, fav.toObject()), { clubs });
}
function getClubCategory(tags) {
    const t = tags.map((s) => s.toLowerCase());
    if (t.some((s) => s === "driver" || s === "drivers"))
        return "driver";
    if (t.some((s) => s === "fairway-wood" || s === "fairway-woods" || s === "fairway wood" || s === "hybrid" || s === "hybrids"))
        return "fairway-woods-hybrids";
    if (t.some((s) => s === "iron" || s === "irons"))
        return "irons";
    if (t.some((s) => s === "wedge" || s === "wedges"))
        return "wedges";
    if (t.some((s) => s === "putter" || s === "putters"))
        return "putter";
    return undefined;
}
function getShaftType(tags) {
    const t = tags.map((s) => s.toLowerCase());
    if (t.some((s) => s === "flexible" || s === "flex" || s === "regular"))
        return "flexible";
    if (t.some((s) => s === "stiff" || s === "stiff-flex" || s === "x-stiff"))
        return "stiff";
    return undefined;
}
function getIronType(tags) {
    const t = tags.map((s) => s.toLowerCase());
    if (t.some((s) => s === "blades" || s === "blade"))
        return "blades";
    if (t.some((s) => s === "cavity-back" || s === "cavity back" || s === "cavity backs"))
        return "cavity-back";
    if (t.some((s) => s === "muscle-back" || s === "muscle back" || s === "muscle backs"))
        return "muscle-back";
    return undefined;
}
// --- Collection-based category map ---
function collectionNameToCategory(name) {
    const n = name.toLowerCase();
    if (n.includes("driver"))
        return "driver";
    if (n.includes("wood") || n.includes("hybrid"))
        return "fairway-woods-hybrids";
    if (n.includes("iron"))
        return "irons";
    if (n.includes("wedge"))
        return "wedges";
    if (n.includes("putter"))
        return "putter";
    return undefined;
}
// Simple in-process cache (5 min TTL)
let _categoryMapCache = null;
let _categoryMapExpiry = 0;
async function buildCategoryMap() {
    var _a, _b, _c;
    if (_categoryMapCache && Date.now() < _categoryMapExpiry) {
        return _categoryMapCache;
    }
    try {
        const res = await fetch("https://firestx.booqable.com/api/4/collections?include=product_groups", { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
        if (!res.ok)
            return new Map();
        const json = (await res.json());
        const map = new Map();
        for (const col of json.data) {
            const category = collectionNameToCategory(col.attributes.name);
            if (!category)
                continue;
            for (const pg of (_c = (_b = (_a = col.relationships) === null || _a === void 0 ? void 0 : _a.product_groups) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : []) {
                map.set(pg.id, category);
            }
        }
        _categoryMapCache = map;
        _categoryMapExpiry = Date.now() + 5 * 60 * 1000;
        return map;
    }
    catch (_d) {
        return new Map();
    }
}
function transformProduct(p, categoryMap) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const tags = (_a = p.attributes.tag_list) !== null && _a !== void 0 ? _a : [];
    // Prefer collection-based category; fall back to tag-based
    const productGroupId = (_b = p.attributes.product_group_id) !== null && _b !== void 0 ? _b : ((_e = (_d = (_c = p.relationships) === null || _c === void 0 ? void 0 : _c.product_group) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.id);
    const category = (productGroupId && (categoryMap === null || categoryMap === void 0 ? void 0 : categoryMap.get(productGroupId))) ||
        getClubCategory(tags);
    return {
        _id: p.id,
        booqableProductId: p.id,
        name: p.attributes.name,
        sku: (_f = p.attributes.sku) !== null && _f !== void 0 ? _f : undefined,
        image: (_g = p.attributes.photo_url) !== null && _g !== void 0 ? _g : undefined,
        description: (_h = p.attributes.description) !== null && _h !== void 0 ? _h : undefined,
        metadata: p.attributes,
        isActive: !p.attributes.archived,
        category,
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
//# sourceMappingURL=helper.js.map