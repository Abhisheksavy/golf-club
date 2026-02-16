import { useState, useEffect, useCallback } from "react";
import type { FavouriteSet, Club } from "../types";
import { seedFavouriteSets } from "../data/mockFavouriteSets";

const STORAGE_KEY = "golf-favourite-sets";

const loadSets = (): FavouriteSet[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedFavouriteSets));
  return seedFavouriteSets;
};

const saveSets = (sets: FavouriteSet[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
};

export const useFavouriteSets = () => {
  const [sets, setSets] = useState<FavouriteSet[]>(loadSets);

  useEffect(() => {
    saveSets(sets);
  }, [sets]);

  const createSet = useCallback((name: string, clubs: Club[]) => {
    const newSet: FavouriteSet = {
      _id: `set-${Date.now()}`,
      user: "user-001",
      setName: name,
      clubs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSets((prev) => [...prev, newSet]);
    return newSet;
  }, []);

  const deleteSet = useCallback((setId: string) => {
    setSets((prev) => prev.filter((s) => s._id !== setId));
  }, []);

  const renameSet = useCallback((setId: string, newName: string) => {
    setSets((prev) =>
      prev.map((s) =>
        s._id === setId
          ? { ...s, setName: newName, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const updateSetClubs = useCallback((setId: string, clubs: Club[]) => {
    setSets((prev) =>
      prev.map((s) =>
        s._id === setId
          ? { ...s, clubs, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const getSet = useCallback(
    (setId: string) => sets.find((s) => s._id === setId),
    [sets]
  );

  return {
    sets,
    createSet,
    deleteSet,
    renameSet,
    updateSetClubs,
    getSet,
  };
};
