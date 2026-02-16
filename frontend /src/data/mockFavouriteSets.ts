import type { FavouriteSet, Club } from "../types";
import { mockClubs } from "./mockClubs";

const getClubsByIds = (ids: string[]): Club[] =>
  mockClubs.filter((c) => ids.includes(c._id));

export const seedFavouriteSets: FavouriteSet[] = [
  {
    _id: "set-001",
    user: "user-001",
    setName: "Weekend Round",
    clubs: getClubsByIds(["club-001", "club-004", "club-008", "club-011", "club-013"]),
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
  },
  {
    _id: "set-002",
    user: "user-001",
    setName: "Practice Session",
    clubs: getClubsByIds(["club-005", "club-009", "club-010", "club-012"]),
    createdAt: "2025-02-05T14:00:00Z",
    updatedAt: "2025-02-05T14:00:00Z",
  },
];
