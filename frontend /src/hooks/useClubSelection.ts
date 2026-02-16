import { useState, useCallback } from "react";
import type { Club } from "../types";

export const useClubSelection = () => {
  const [selected, setSelected] = useState<Map<string, Club>>(new Map());

  const toggle = useCallback((club: Club) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(club._id)) {
        next.delete(club._id);
      } else {
        next.set(club._id, club);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelected(new Map());
  }, []);

  const selectMany = useCallback((clubs: Club[]) => {
    setSelected(new Map(clubs.map((c) => [c._id, c])));
  }, []);

  const isSelected = useCallback(
    (clubId: string) => selected.has(clubId),
    [selected]
  );

  return {
    selected,
    selectedClubs: Array.from(selected.values()),
    selectedCount: selected.size,
    toggle,
    clear,
    selectMany,
    isSelected,
  };
};
