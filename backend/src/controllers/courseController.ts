import type { Request, Response as ExpressResponse } from "express";
import { StatusCodes } from "http-status-codes";
import { Response } from "../utils/response";

interface BooqableAvailability {
  id: string;
  type: string;
  attributes: {
    date: string;
    available: boolean;
    [key: string]: unknown;
  };
}

interface BooqableLocation {
  id: string;
  type: string;
  attributes: {
    name: string;
    address_line_1: string | null;
    city: string | null;
    country: string | null;
    [key: string]: unknown;
  };
}

export const getCourses = async (
  _req: Request,
  res: ExpressResponse
): Promise<void> => {
  try {
    const apiRes = await fetch("https://firestx.booqable.com/api/4/locations", {
      headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` },
    });

    if (!apiRes.ok) {
      res
        .status(StatusCodes.BAD_GATEWAY)
        .json(
          Response.failure(
            "Failed to fetch courses from Booqable",
            null,
            StatusCodes.BAD_GATEWAY
          )
        );
      return;
    }

    const { data } = (await apiRes.json()) as { data: BooqableLocation[] };

    const courses = data.map((loc) => ({
      id: loc.id,
      name: loc.attributes.name,
      address:
        [
          loc.attributes.address_line_1,
          loc.attributes.city,
          loc.attributes.country,
        ]
          .filter(Boolean)
          .join(", ") || undefined,
    }));

    res
      .status(StatusCodes.OK)
      .json(
        Response.success(
          "Courses fetched successfully",
          courses,
          StatusCodes.OK
        )
      );
  } catch (error) {
    console.error("getCourses error:", error);
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

export const getAvailableDates = async (
  req: Request,
  res: ExpressResponse
): Promise<void> => {
  // const locationId = String(req.params.locationId);
  const year = typeof req.query.year === "string" ? req.query.year : undefined;
  const month =
    typeof req.query.month === "string" ? req.query.month : undefined;

  if (!year || !month) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        Response.failure(
          "year and month are required",
          null,
          StatusCodes.BAD_REQUEST
        )
        
      );
    return;
  }

  try {
    // Booqable requires subject_id + subject_type=item — fetch the first active product
    const productsRes = await fetch(
      "https://firestx.booqable.com/api/4/products?filter[archived]=false&page[size]=1",
      { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
    );

    if (!productsRes.ok) {
      const errBody = await productsRes.text();
      console.error("Booqable products error:", productsRes.status, errBody);
      res
        .status(StatusCodes.BAD_GATEWAY)
        .json(
          Response.failure(
            "Failed to fetch products from Booqable",
            null,
            StatusCodes.BAD_GATEWAY
          )
        );
      return;
    }

    const productsJson = (await productsRes.json()) as {
      data: { id: string }[];
    };
    const firstProduct = productsJson.data[0];

    if (!firstProduct) {
      res
        .status(StatusCodes.OK)
        .json(
          Response.success(
            "Available dates fetched",
            { dates: [] },
            StatusCodes.OK
          )
        );
      return;
    }

    // Note: location_id is intentionally omitted — club stock is not location-specific
    // in this Booqable setup. We check product availability globally.
    const qs = [
      `filter[subject_type]=item`,
      `filter[subject_id]=${encodeURIComponent(firstProduct.id)}`,
      `filter[year]=${encodeURIComponent(year)}`,
      `filter[month]=${encodeURIComponent(month)}`,
    ].join("&");

    const apiRes = await fetch(
      `https://firestx.booqable.com/api/4/availabilities?${qs}`,
      { headers: { Authorization: `Bearer ${process.env.BOOQABLE_TOKEN}` } }
    );

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error("Booqable availabilities error:", apiRes.status, errBody);
      res
        .status(StatusCodes.BAD_GATEWAY)
        .json(
          Response.failure(
            "Failed to fetch available dates",
            null,
            StatusCodes.BAD_GATEWAY
          )
        );
      return;
    }

    const json = (await apiRes.json()) as { data?: BooqableAvailability[] };
    const records = json.data ?? [];
    const dates = records
      .filter((r) => r.attributes.available === true)
      .map((r) => r.attributes.date);

    res
      .status(StatusCodes.OK)
      .json(
        Response.success("Available dates fetched", { dates }, StatusCodes.OK)
      );
  } catch (error) {
    console.error("getAvailableDates error:", error);
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
