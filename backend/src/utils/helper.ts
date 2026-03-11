import { fetchProductsByIds } from "../controllers/clubController";
import { Favourite } from "../models/favouriteSets";
import { BooqableProduct } from "../types/booqable.type";

export async function enrichFavourite(fav: InstanceType<typeof Favourite>) {
  const reversedIds = [...(fav.clubs as string[])].reverse();
  const clubs = await fetchProductsByIds(reversedIds);
  return { ...fav.toObject(), clubs };
}

export function getClubCategory(tags: string[]): string | undefined {
  const t = tags.map((s) => s.toLowerCase());
  if (t.some((s) => s.includes("driver"))) return "driver";
  if (t.some((s) => s.includes("fairway") || s.includes("wood") || s.includes("hybrid"))) return "fairway-woods-hybrids";
  if (t.some((s) => s.includes("iron"))) return "irons";
  if (t.some((s) => s.includes("wedge"))) return "wedges";
  if (t.some((s) => s.includes("putter"))) return "putter";
  return undefined;
}

export function getShaftType(tags: string[]): string | undefined {
  const t = tags.map((s) => s.toLowerCase());
  if (t.some((s) => s === "flexible" || s === "flex" || s === "regular")) return "flexible";
  if (t.some((s) => s === "stiff" || s === "stiff-flex" || s === "x-stiff")) return "stiff";
  return undefined;
}

export function getIronType(tags: string[]): string | undefined {
  const t = tags.map((s) => s.toLowerCase());
  if (t.some((s) => s === "blades" || s === "blade")) return "blades";
  if (t.some((s) => s === "cavity-back" || s === "cavity back" || s === "cavity backs")) return "cavity-back";
  if (t.some((s) => s === "muscle-back" || s === "muscle back" || s === "muscle backs")) return "muscle-back";
  return undefined;
}

// --- Collection-based category map ---

function collectionNameToCategory(name: string): string | undefined {
  const n = name.toLowerCase().trim();
  if (n === "all products") return undefined; // skip meta-collection
  // Established keys for the 5 golf club types
  if (n.includes("driver")) return "driver";
  if (n.includes("wood") || n.includes("hybrid")) return "fairway-woods-hybrids";
  if (n.includes("iron")) return "irons";
  if (n.includes("wedge")) return "wedges";
  if (n.includes("putter")) return "putter";
  // Slugify any other collection name (e.g. "Complete Bags" → "complete-bags")
  return n.replace(/\s+&\s+/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Simple in-process cache (5 min TTL)
let _categoryMapCache: Map<string, string> | null = null;
let _categoryMapExpiry = 0;

let _collectionsCache: Array<{ key: string; label: string }> | null = null;
let _collectionsExpiry = 0;

export async function getCollections(): Promise<Array<{ key: string; label: string }>> {
  if (_collectionsCache && Date.now() < _collectionsExpiry) {
    return _collectionsCache;
  }
  try {
    const res = await fetch(
      "https://firestx.booqable.com/api/4/collections?page[size]=100",
      { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data: Array<{ id: string; attributes: { name: string } }>;
    };
    const collections = (json.data ?? [])
      .map((c) => ({ key: collectionNameToCategory(c.attributes.name), label: c.attributes.name }))
      .filter((c): c is { key: string; label: string } => c.key !== undefined);
    _collectionsCache = collections;
    _collectionsExpiry = Date.now() + 5 * 60 * 1000;
    return collections;
  } catch (err) {
    console.error("getCollections error:", err);
    return [];
  }
}

export async function buildCategoryMap(): Promise<Map<string, string>> {
  if (_categoryMapCache && Date.now() < _categoryMapExpiry) {
    return _categoryMapCache;
  }
  try {
    // Step 1: Fetch all collections to get their IDs and names
    const colRes = await fetch(
      "https://firestx.booqable.com/api/4/collections?page[size]=100",
      { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
    );
    if (!colRes.ok) {
      console.error("buildCategoryMap: collections fetch error", colRes.status);
      return new Map();
    }
    const colJson = (await colRes.json()) as {
      data: Array<{ id: string; attributes: { name: string } }>;
    };
    // Step 2: For each relevant collection, fetch product_groups via filter
    const map = new Map<string, string>();
    for (const col of colJson.data ?? []) {
      const category = collectionNameToCategory(col.attributes.name);
      if (!category) continue;

      const pgRes = await fetch(
        `https://firestx.booqable.com/api/4/product_groups?filter[collection_id]=${col.id}&page[size]=100`,
        { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
      );
      if (!pgRes.ok) {
        console.error(`buildCategoryMap: product_groups filter error ${pgRes.status} for collection ${col.id}`);
        continue;
      }
      const pgJson = (await pgRes.json()) as { data: Array<{ id: string }> };
      for (const pg of pgJson.data ?? []) {
        map.set(pg.id, category);
      }
    }
    _categoryMapCache = map;
    _categoryMapExpiry = Date.now() + 5 * 60 * 1000;
    return map;
  } catch (err) {
    console.error("buildCategoryMap error:", err);
    return new Map();
  }
}

export function transformProduct(p: BooqableProduct, categoryMap?: Map<string, string>) {
  const tags: string[] = p.attributes.tag_list ?? [];

  // Prefer collection-based category; fall back to tag-based
  const productGroupId =
    (p.attributes.product_group_id as string | undefined) ??
    (p.relationships?.product_group?.data?.id);
  const category =
    (productGroupId && categoryMap?.get(productGroupId)) ||
    getClubCategory(tags);

  return {
    _id: p.id,
    booqableProductId: p.id,
    name: p.attributes.name,
    sku: p.attributes.sku ?? undefined,
    image: p.attributes.photo_url ?? undefined,
    description: p.attributes.description ?? undefined,
    metadata: p.attributes,
    isActive: !p.attributes.archived,
    category,
    shaftType: getShaftType(tags),
    ironType: getIronType(tags),
  };
}

export async function fetchPage(
  page: number,
  pageSize: number
): Promise<{ data: BooqableProduct[]; meta: { total_count: number } }> {
  const url = new URL("https://firestx.booqable.com/api/4/products");
  url.searchParams.set("page[number]", String(page));
  url.searchParams.set("page[size]", String(pageSize));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
  });

  if (!res.ok) throw new Error(`Booqable API error: ${res.status}`);

  return res.json() as Promise<{
    data: BooqableProduct[];
    meta: { total_count: number };
  }>;
}
