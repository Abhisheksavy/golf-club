// Auth types
export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface MagicLinkResponse {
  message: string;
}

// Club types
export interface Club {
  _id: string;
  product_type:string
  booqableProductId: string;
  name: string;
  sku?: string;
  image?: string;
  description?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableClub extends Club {
  available: boolean;
}

export interface PaginatedClubs {
  clubs: Club[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Favourite Set types
export interface FavouriteSet {
  _id: string;
  user: string;
  setName: string;
  clubs: Club[] | string[];
  createdAt: string;
  updatedAt: string;
}

// Course types
export interface Course {
  id: string;
  name: string;
  location: string;
}

// Reservation types
export interface Reservation {
  _id: string;
  user: string;
  course: string;
  date: string;
  clubs: Club[] | string[];
  status: "pending" | "confirmed" | "cancelled";
  savedAsBag?: string;
  createdAt: string;
  updatedAt: string;
}

// API Error
export interface ApiError {
  message: string;
}
