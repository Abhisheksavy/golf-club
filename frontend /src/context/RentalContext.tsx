import { createContext, useContext, useState } from "react";
import type { Course, Club } from "../types";

interface RentalState {
  selectedCourse: Course | null;
  selectedDate: string | null;
  selectedClubs: Club[];
  saveToBag: boolean;
  isGuest: boolean | null;
  handedness: "right" | "left" | null;
  gender: "male" | "female" | null;
  height: string | null;
  preferenceMode: "own" | "guided" | null;
  playingLevel: "beginner" | "intermediate" | "expert" | null;
  swingStrength: "gentle" | "strong" | null;
}

interface RentalContextType extends RentalState {
  setCourse: (course: Course | null) => void;
  setDate: (date: string | null) => void;
  setClubs: (clubs: Club[]) => void;
  setSaveToBag: (save: boolean) => void;
  setIsGuest: (isGuest: boolean) => void;
  setHandedness: (h: "right" | "left") => void;
  setGender: (g: "male" | "female") => void;
  setHeight: (h: string) => void;
  setPreferenceMode: (m: "own" | "guided") => void;
  setPlayingLevel: (l: "beginner" | "intermediate" | "expert") => void;
  setSwingStrength: (s: "gentle" | "strong") => void;
  reset: () => void;
}

const RentalContext = createContext<RentalContextType | null>(null);

const SESSION_KEY = "rental_ctx";

function loadSaved(): Partial<RentalState> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(updates: Partial<RentalState>) {
  try {
    const current = loadSaved();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, ...updates }));
  } catch {}
}

export const RentalProvider = ({ children }: { children: React.ReactNode }) => {
  const saved = loadSaved();

  const [selectedCourse, _setCourse] = useState<Course | null>(saved.selectedCourse ?? null);
  const [selectedDate, _setDate] = useState<string | null>(saved.selectedDate ?? null);
  const [selectedClubs, _setClubs] = useState<Club[]>(saved.selectedClubs ?? []);
  const [saveToBag, _setSaveToBag] = useState<boolean>(saved.saveToBag ?? false);
  const [isGuest, _setIsGuest] = useState<boolean | null>(saved.isGuest ?? null);
  const [handedness, _setHandedness] = useState<"right" | "left" | null>(saved.handedness ?? null);
  const [gender, _setGender] = useState<"male" | "female" | null>(saved.gender ?? null);
  const [height, _setHeight] = useState<string | null>(saved.height ?? null);
  const [preferenceMode, _setPreferenceMode] = useState<"own" | "guided" | null>(saved.preferenceMode ?? null);
  const [playingLevel, _setPlayingLevel] = useState<"beginner" | "intermediate" | "expert" | null>(saved.playingLevel ?? null);
  const [swingStrength, _setSwingStrength] = useState<"gentle" | "strong" | null>(saved.swingStrength ?? null);

  const setCourse = (v: Course | null) => { _setCourse(v); persist({ selectedCourse: v }); };
  const setDate = (v: string | null) => { _setDate(v); persist({ selectedDate: v }); };
  const setClubs = (v: Club[]) => { _setClubs(v); persist({ selectedClubs: v }); };
  const setSaveToBag = (v: boolean) => { _setSaveToBag(v); persist({ saveToBag: v }); };
  const setIsGuest = (v: boolean) => { _setIsGuest(v); persist({ isGuest: v }); };
  const setHandedness = (v: "right" | "left") => { _setHandedness(v); persist({ handedness: v }); };
  const setGender = (v: "male" | "female") => { _setGender(v); persist({ gender: v }); };
  const setHeight = (v: string) => { _setHeight(v); persist({ height: v }); };
  const setPreferenceMode = (v: "own" | "guided") => { _setPreferenceMode(v); persist({ preferenceMode: v }); };
  const setPlayingLevel = (v: "beginner" | "intermediate" | "expert") => { _setPlayingLevel(v); persist({ playingLevel: v }); };
  const setSwingStrength = (v: "gentle" | "strong") => { _setSwingStrength(v); persist({ swingStrength: v }); };

  const reset = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("guestSessionBag");
    _setCourse(null);
    _setDate(null);
    _setClubs([]);
    _setSaveToBag(false);
    _setIsGuest(null);
    _setHandedness(null);
    _setGender(null);
    _setHeight(null);
    _setPreferenceMode(null);
    _setPlayingLevel(null);
    _setSwingStrength(null);
  };

  return (
    <RentalContext.Provider
      value={{
        selectedCourse,
        selectedDate,
        selectedClubs,
        saveToBag,
        isGuest,
        handedness,
        gender,
        height,
        preferenceMode,
        playingLevel,
        swingStrength,
        setCourse,
        setDate,
        setClubs,
        setSaveToBag,
        setIsGuest,
        setHandedness,
        setGender,
        setHeight,
        setPreferenceMode,
        setPlayingLevel,
        setSwingStrength,
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
