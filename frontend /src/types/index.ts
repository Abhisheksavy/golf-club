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

// Favourite Set types
export interface FavouriteSet {
  _id: string;
  user: string;
  setName: string;
  clubs: Club[] | string[];
  createdAt: string;
  updatedAt: string;
}

// API Error
export interface ApiError {
  message: string;
}
