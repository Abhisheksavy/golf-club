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
    [key: string]: unknown;
  };
}

function transformProduct(p: BooqableProduct) {
  return {
    _id: p.id,
    booqableProductId: p.id,
    name: p.attributes.name,
    sku: p.attributes.sku ?? undefined,
    image: p.attributes.photo_url ?? undefined,
    description: p.attributes.description ?? undefined,
    metadata: p.attributes,
    isActive: !p.attributes.archived,
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

async function fetchAllBooqableProducts(): Promise<BooqableProduct[]> {
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

export const getAvailableClubs = async (
  req: AuthRequest,
  res: ExpressResponse
): Promise<void> => {
  try {
    const allProducts = await fetchAllBooqableProducts();
    const active = allProducts.filter((p) => !p.attributes.archived);

    const { course, date } = req.query;
    const seed = `${course}-${date}`;
    const available = active.map((p) => {
      const hash = simpleHash(`${seed}-${p.id}`);
      return { ...transformProduct(p), available: hash % 5 !== 0 };
    });

    res
      .status(StatusCodes.OK)
      .json(
        Response.success("Available clubs fetched", available, StatusCodes.OK)
      );
  } catch (error) {
    console.error("getAvailableClubs error:", error);
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

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
