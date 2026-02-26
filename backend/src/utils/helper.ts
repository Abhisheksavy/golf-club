import { fetchProductsByIds } from "../controllers/clubController";
import { Favourite } from "../models/favouriteSets";
import { BooqableProduct } from "../types/booqable.type";

export async function enrichFavourite(fav: InstanceType<typeof Favourite>) {
  const reversedIds = [...(fav.clubs as string[])].reverse();
  const clubs = await fetchProductsByIds(reversedIds);
  return { ...fav.toObject(), clubs };
}

export function getClubCategory(tags: string[]): string | undefined {
  if (tags.includes("driver")) return "driver";
  if (tags.includes("fairway-wood") || tags.includes("hybrid"))
    return "fairway-woods-hybrids";
  if (tags.includes("iron")) return "irons";
  if (tags.includes("wedge")) return "wedges";
  if (tags.includes("putter")) return "putter";
  return undefined;
}

export function getShaftType(tags: string[]): string | undefined {
  if (tags.includes("flexible")) return "flexible";
  if (tags.includes("stiff")) return "stiff";
  return undefined;
}

export function getIronType(tags: string[]): string | undefined {
  if (tags.includes("blades")) return "blades";
  if (tags.includes("cavity-back")) return "cavity-back";
  if (tags.includes("muscle-back")) return "muscle-back";
  return undefined;
}

export function transformProduct(p: BooqableProduct) {
  const tags: string[] = p.attributes.tag_list ?? [];
  return {
    _id: p.id,
    booqableProductId: p.id,
    name: p.attributes.name,
    sku: p.attributes.sku ?? undefined,
    image: p.attributes.photo_url ?? undefined,
    description: p.attributes.description ?? undefined,
    metadata: p.attributes,
    isActive: !p.attributes.archived,
    category: getClubCategory(tags),
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
