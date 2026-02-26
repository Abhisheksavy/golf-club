export interface BooqableAvailability {
  id: string;
  type: string;
  attributes: {
    date: string;
    available: boolean;
    [key: string]: unknown;
  };
}

export interface BooqableLocation {
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

export interface BooqableProduct {
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
