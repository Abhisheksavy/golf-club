import type { AuthRequest } from "../middlewares/auth";
import { StatusCodes } from "http-status-codes";
import { Response as ExpressResponse } from "express";
import { Response } from "../utils/response";

interface BooqableProduct {
  id: string;
  type: string;
  attributes: {
    name: string;
    sku: string | null;
    description: string | null;
    archived: boolean;
    photo_url: string | null;
    tag_list: string[];
    [key: string]: unknown;
  };
}

function getClubCategory(tags: string[]): string | undefined {
  if (tags.includes("driver")) return "driver";
  if (tags.includes("fairway-wood") || tags.includes("hybrid")) return "fairway-woods-hybrids";
  if (tags.includes("iron")) return "irons";
  if (tags.includes("wedge")) return "wedges";
  if (tags.includes("putter")) return "putter";
  return undefined;
}

function getShaftType(tags: string[]): string | undefined {
  if (tags.includes("flexible")) return "flexible";
  if (tags.includes("stiff")) return "stiff";
  return undefined;
}

function getIronType(tags: string[]): string | undefined {
  if (tags.includes("blades")) return "blades";
  if (tags.includes("cavity-back")) return "cavity-back";
  if (tags.includes("muscle-back")) return "muscle-back";
  return undefined;
}

function transformProduct(p: BooqableProduct) {
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

async function fetchPage(
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

export async function fetchAllBooqableProducts(): Promise<BooqableProduct[]> {
  const pageSize = 100;

  const first = await fetchPage(1, pageSize);
  const totalPages = Math.ceil(first.meta.total_count / pageSize);

  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2, pageSize))
  );

  return [first.data, ...rest.map((p) => p.data)].flat();
}

export async function fetchProductsByIds(
  ids: string[]
): Promise<ReturnType<typeof transformProduct>[]> {
  const all = await fetchAllBooqableProducts();
  return all.filter((p) => ids.includes(p.id)).map(transformProduct);
}

export const getClubs = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const {
      brand,
      category,
      search,
      isActive: isActiveParam,
      archived: archivedParam,
    } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10)
    );

    let filtered = await fetchAllBooqableProducts();

    if (archivedParam === "true" || isActiveParam === "false") {
      filtered = filtered.filter((p) => p.attributes.archived);
    } else if (archivedParam !== "all" && isActiveParam !== "all") {
      filtered = filtered.filter((p) => !p.attributes.archived);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter((p) =>
        p.attributes.name.toLowerCase().includes(q)
      );
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
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "clubs fetched successfully",
          { clubs, total, totalPages, page, limit },
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("getClubs error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure(
          "Server error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

export const getClubById = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const apiRes = await fetch(
      `https://firestx.booqable.com/api/4/products/${req.params.id}`,
      { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
    );

    if (!apiRes.ok) {
      res
        .status(StatusCodes.OK)
        .json(Response.success("Club not found", null, StatusCodes.OK));
      return;
    }

    const { data } = (await apiRes.json()) as { data: BooqableProduct };
    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Club fetch by Id",
          transformProduct(data),
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("getClubById error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Response.failure(
          "Server error",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

interface BooqableLocation {
  id: string;
  attributes: {
    name: string;
    [key: string]: unknown;
  };
}

async function fetchLocations(): Promise<BooqableLocation[]> {
  const res = await fetch("https://firestx.booqable.com/api/4/locations", {
    headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Booqable locations API error: ${res.status}`);
  const json = (await res.json()) as { data: BooqableLocation[] };
  return json.data;
}


async function checkProductAvailableOnDate(
  productId: string,
  locationId: string,
  year: number,
  month: number,
  day: number
): Promise<boolean> {
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
    if (!res.ok) return true; // graceful degradation on error

    const json = (await res.json()) as { data: Array<{ attributes: { available: boolean } }> };
    if (!json.data || json.data.length === 0) return true;
    return json.data[0].attributes.available;
  } catch {
    return true; // graceful degradation
  }
}

export const getAvailableClubs = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const { course, date } = req.query as { course?: string; date?: string };

    const allProducts = await fetchAllBooqableProducts();
    const active = allProducts.filter((p) => !p.attributes.archived);

    // Course-only mode (no date): all active products are available.
    // Booqable products are bulk/non-trackable so there are no per-location
    // stock item records — all clubs are considered present at the course.
    if (!date) {
      const result = active.map((p) => ({
        ...transformProduct(p),
        available: true,
        unavailabilityReason: null,
      }));
      res.status(StatusCodes.OK).json(Response.success("Available clubs fetched", result, StatusCodes.OK));
      return;
    }

    // Course + date mode: check availability per product on the requested date.
    let locationId: string | null = null;
    if (course) {
      const locations = await fetchLocations();
      const match = locations.find(
        (l) => l.attributes.name.toLowerCase() === course.toLowerCase()
      );
      locationId = match?.id ?? null;
    }

    const parts = date.split("-");
    const parsedDate = parts.length === 3
      ? { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) }
      : null;

    if (!parsedDate) {
      res.status(StatusCodes.BAD_REQUEST).json(Response.failure("Invalid date format", null, StatusCodes.BAD_REQUEST));
      return;
    }

    const available = await Promise.all(
      active.map(async (p) => {
        const isAvailable = locationId
          ? await checkProductAvailableOnDate(p.id, locationId, parsedDate.year, parsedDate.month, parsedDate.day)
          : true;
        return {
          ...transformProduct(p),
          available: isAvailable,
          unavailabilityReason: isAvailable ? null : ("on-this-date" as const),
        };
      })
    );

    res.status(StatusCodes.OK).json(Response.success("Available clubs fetched", available, StatusCodes.OK));
  } catch (error) {
    console.error("getAvailableClubs error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(Response.failure("Server error", null, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
