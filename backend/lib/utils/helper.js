"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichFavourite = enrichFavourite;
exports.getClubCategory = getClubCategory;
exports.getShaftType = getShaftType;
exports.getIronType = getIronType;
exports.getCollections = getCollections;
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
    if (t.some((s) => s.includes("driver")))
        return "driver";
    if (t.some((s) => s.includes("fairway") || s.includes("wood") || s.includes("hybrid")))
        return "fairway-woods-hybrids";
    if (t.some((s) => s.includes("iron")))
        return "irons";
    if (t.some((s) => s.includes("wedge")))
        return "wedges";
    if (t.some((s) => s.includes("putter")))
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
    const n = name.toLowerCase().trim();
    if (n === "all products")
        return undefined; // skip meta-collection
    // Established keys for the 5 golf club types
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
    // Slugify any other collection name (e.g. "Complete Bags" → "complete-bags")
    return n.replace(/\s+&\s+/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
// Simple in-process cache (5 min TTL)
let _categoryMapCache = null;
let _categoryMapExpiry = 0;
let _collectionsCache = null;
let _collectionsExpiry = 0;
async function getCollections() {
    var _a;
    if (_collectionsCache && Date.now() < _collectionsExpiry) {
        return _collectionsCache;
    }
    try {
        const res = await fetch("https://firestx.booqable.com/api/4/collections?page[size]=100", { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
        if (!res.ok)
            return [];
        const json = (await res.json());
        const collections = ((_a = json.data) !== null && _a !== void 0 ? _a : [])
            .map((c) => ({ key: collectionNameToCategory(c.attributes.name), label: c.attributes.name }))
            .filter((c) => c.key !== undefined);
        _collectionsCache = collections;
        _collectionsExpiry = Date.now() + 5 * 60 * 1000;
        return collections;
    }
    catch (err) {
        console.error("getCollections error:", err);
        return [];
    }
}
async function buildCategoryMap() {
    var _a, _b;
    if (_categoryMapCache && Date.now() < _categoryMapExpiry) {
        return _categoryMapCache;
    }
    try {
        // Step 1: Fetch all collections to get their IDs and names
        const colRes = await fetch("https://firestx.booqable.com/api/4/collections?page[size]=100", { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
        if (!colRes.ok) {
            console.error("buildCategoryMap: collections fetch error", colRes.status);
            return new Map();
        }
        const colJson = (await colRes.json());
        // Step 2: For each relevant collection, fetch product_groups via filter
        const map = new Map();
        for (const col of (_a = colJson.data) !== null && _a !== void 0 ? _a : []) {
            const category = collectionNameToCategory(col.attributes.name);
            if (!category)
                continue;
            const pgRes = await fetch(`https://firestx.booqable.com/api/4/product_groups?filter[collection_id]=${col.id}&page[size]=100`, { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } });
            if (!pgRes.ok) {
                console.error(`buildCategoryMap: product_groups filter error ${pgRes.status} for collection ${col.id}`);
                continue;
            }
            const pgJson = (await pgRes.json());
            for (const pg of (_b = pgJson.data) !== null && _b !== void 0 ? _b : []) {
                map.set(pg.id, category);
            }
        }
        _categoryMapCache = map;
        _categoryMapExpiry = Date.now() + 5 * 60 * 1000;
        return map;
    }
    catch (err) {
        console.error("buildCategoryMap error:", err);
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