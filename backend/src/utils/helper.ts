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
  if (t.some((s) => s === "driver" || s === "drivers")) return "driver";
  if (t.some((s) => s === "fairway-wood" || s === "fairway-woods" || s === "fairway wood" || s === "hybrid" || s === "hybrids"))
    return "fairway-woods-hybrids";
  if (t.some((s) => s === "iron" || s === "irons")) return "irons";
  if (t.some((s) => s === "wedge" || s === "wedges")) return "wedges";
  if (t.some((s) => s === "putter" || s === "putters")) return "putter";
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
  const n = name.toLowerCase();
  if (n.includes("driver")) return "driver";
  if (n.includes("wood") || n.includes("hybrid")) return "fairway-woods-hybrids";
  if (n.includes("iron")) return "irons";
  if (n.includes("wedge")) return "wedges";
  if (n.includes("putter")) return "putter";
  return undefined;
}

// Simple in-process cache (5 min TTL)
let _categoryMapCache: Map<string, string> | null = null;
let _categoryMapExpiry = 0;

export async function buildCategoryMap(): Promise<Map<string, string>> {
  if (_categoryMapCache && Date.now() < _categoryMapExpiry) {
    return _categoryMapCache;
  }
  try {
    const res = await fetch(
      "https://firestx.booqable.com/api/4/collections?include=product_groups",
      { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
    );
    if (!res.ok) return new Map();

    const json = (await res.json()) as {
      data: Array<{
        id: string;
        attributes: { name: string };
        relationships?: {
          product_groups?: { data?: Array<{ id: string }> };
        };
      }>;
    };

    const map = new Map<string, string>();
    for (const col of json.data) {
      const category = collectionNameToCategory(col.attributes.name);
      if (!category) continue;
      for (const pg of col.relationships?.product_groups?.data ?? []) {
        map.set(pg.id, category);
      }
    }

    _categoryMapCache = map;
    _categoryMapExpiry = Date.now() + 5 * 60 * 1000;
    return map;
  } catch {
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
