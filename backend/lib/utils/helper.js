"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichFavourite = enrichFavourite;
exports.getClubCategory = getClubCategory;
exports.getShaftType = getShaftType;
exports.getIronType = getIronType;
exports.transformProduct = transformProduct;
exports.fetchPage = fetchPage;
const clubController_1 = require("../controllers/clubController");
async function enrichFavourite(fav) {
    const reversedIds = [...fav.clubs].reverse();
    const clubs = await (0, clubController_1.fetchProductsByIds)(reversedIds);
    return Object.assign(Object.assign({}, fav.toObject()), { clubs });
}
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
//# sourceMappingURL=helper.js.map