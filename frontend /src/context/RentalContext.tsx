import { createContext, useContext, useState } from "react";
import type { Course, Club } from "../types";

interface RentalState {
  selectedCourse: Course | null;
  selectedDate: string | null;
  selectedClubs: Club[];
  saveToBag: boolean;
}

interface RentalContextType extends RentalState {
  setCourse: (course: Course) => void;
  setDate: (date: string) => void;
  setClubs: (clubs: Club[]) => void;
  setSaveToBag: (save: boolean) => void;
  reset: () => void;
}

const RentalContext = createContext<RentalContextType | null>(null);

export const RentalProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedClubs, setSelectedClubs] = useState<Club[]>([]);
  const [saveToBag, setSaveToBag] = useState(false);

  const reset = () => {
    setSelectedCourse(null);
    setSelectedDate(null);
    setSelectedClubs([]);
    setSaveToBag(false);
  };

  return (
    <RentalContext.Provider
      value={{
        selectedCourse,
        selectedDate,
        selectedClubs,
        saveToBag,
        setCourse: setSelectedCourse,
        setDate: setSelectedDate,
        setClubs: setSelectedClubs,
        setSaveToBag,
        reset,
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const ctx = useContext(RentalContext);
  if (!ctx) throw new Error("useRental must be used within RentalProvider");
  return ctx;
};
