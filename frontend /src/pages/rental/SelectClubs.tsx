import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getClubs, getAvailableClubs } from "../../api/clubs";
import { getFavourites } from "../../api/favourites";
import type { Club, AvailableClub } from "../../types";

const CATEGORIES = [
  { key: "driver", label: "Driver", optional: true },
  { key: "fairway-woods-hybrids", label: "Fairway Woods & Hybrids", optional: true },
  { key: "irons", label: "Irons", optional: false },
  { key: "wedges", label: "Wedges", optional: true },
  { key: "putter", label: "Putter", optional: false },
  { key: "other", label: "Other", optional: true },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

const SHAFT_OPTIONS = [
  { key: "all", label: "All" },
  { key: "flexible", label: "Flexible" },
  { key: "stiff", label: "Stiff" },
];

const IRON_OPTIONS = [
  { key: "all", label: "All" },
  { key: "cavity-back", label: "Cavity Backs" },
  { key: "muscle-back", label: "Muscle Backs" },
  { key: "blades", label: "Blades" },
];

function assignCategory(club: Club): CategoryKey {
  if (!club.category) return "other";
  const known: CategoryKey[] = ["driver", "fairway-woods-hybrids", "irons", "wedges", "putter"];
  return known.includes(club.category as CategoryKey) ? (club.category as CategoryKey) : "other";
}

const SelectClubs = () => {
  const navigate = useNavigate();
  const {
    selectedCourse,
    selectedDate,
    selectedClubs,
    setClubs,
    saveToBag,
    setSaveToBag,
    playingLevel,
    swingStrength,
  } = useRental();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [categorySearch, setCategorySearch] = useState<Record<string, string>>({});
  const [loadBagMode, setLoadBagMode] = useState(false);
  const autoSelectedRef = useRef(false);

  const [shaftFilter, setShaftFilter] = useState<string>(() => {
    if (swingStrength === "gentle") return "flexible";
    if (swingStrength === "strong") return "stiff";
    return "all";
  });

  const [ironTypeFilter, setIronTypeFilter] = useState<string>(() => {
    if (playingLevel === "beginner") return "cavity-back";
    if (playingLevel === "intermediate") return "muscle-back";
    if (playingLevel === "expert") return "blades";
    return "all";
  });

  const hasCourseAndDate = !!(selectedCourse && selectedDate);
  const hasCourseOnly = !!(selectedCourse && !selectedDate);

  const { data: availableClubsData = [], isLoading: availableLoading } = useQuery({
    queryKey: ["availableClubs", selectedCourse?.name, selectedDate],
    queryFn: () => getAvailableClubs(selectedCourse!.name, selectedDate!),
    enabled: hasCourseAndDate,
  });

  const { data: courseClubsData = [], isLoading: courseLoading } = useQuery({
    queryKey: ["courseClubs", selectedCourse?.name],
    queryFn: () => getAvailableClubs(selectedCourse!.name),
    enabled: hasCourseOnly,
  });

  const { data: allClubsData, isLoading: allLoading } = useQuery({
    queryKey: ["clubs", { limit: 100 }],
    queryFn: () => getClubs({ limit: 100 }),
    enabled: !hasCourseAndDate && !hasCourseOnly,
  });

  const isLoading = hasCourseAndDate ? availableLoading : hasCourseOnly ? courseLoading : allLoading;

  const allClubs: AvailableClub[] = hasCourseAndDate
    ? availableClubsData
    : hasCourseOnly
    ? courseClubsData
    : (allClubsData?.clubs ?? []).map((c) => ({ ...c, available: true }));

  // Auto-expand first category that has clubs
  useEffect(() => {
    if (!autoSelectedRef.current && allClubs.length > 0) {
      autoSelectedRef.current = true;
    }
  }, [allClubs.length]);

  const { data: bags = [] } = useQuery({
    queryKey: ["favourites"],
    queryFn: getFavourites,
  });

  const selectedIds = new Set(selectedClubs.map((c) => c._id));

  const toggleClub = (club: AvailableClub) => {
    if (!club.available) return;
    if (selectedIds.has(club._id)) {
      setClubs(selectedClubs.filter((c) => c._id !== club._id));
    } else {
      setClubs([...selectedClubs, club]);
    }
  };

  const removeClub = (clubId: string) => {
    setClubs(selectedClubs.filter((c) => c._id !== clubId));
  };

  const loadBag = (bagClubs: Club[]) => {
    const availableIds = new Set(
      allClubs.filter((c) => c.available).map((c) => c._id)
    );
    const validClubs = bagClubs.filter((c) => availableIds.has(c._id));
    setClubs(validClubs);
    setLoadBagMode(false);
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSearch = (key: string) => categorySearch[key] ?? "";
  const setSearch = (key: string, val: string) =>
    setCategorySearch((prev) => ({ ...prev, [key]: val }));

  const getClubsForCategory = (key: CategoryKey): AvailableClub[] => {
    let clubs = allClubs.filter((c) => assignCategory(c) === key);

    // Apply shaft filter (not on putter/other)
    if (key !== "putter" && key !== "other" && shaftFilter !== "all") {
      clubs = clubs.filter((c) => c.shaftType === shaftFilter);
    }

    // Apply iron type filter (only irons)
    if (key === "irons" && ironTypeFilter !== "all") {
      clubs = clubs.filter((c) => c.ironType === ironTypeFilter);
    }

    // Apply per-category search
    const q = getSearch(key).toLowerCase().trim();
    if (q) {
      clubs = clubs.filter((c) => c.name.toLowerCase().includes(q));
    }

    return clubs;
  };

  const showAvailability = hasCourseAndDate || hasCourseOnly;

  const subtitle = hasCourseAndDate
    ? `Showing availability at ${selectedCourse!.name} on ${new Date(selectedDate!).toLocaleDateString()}`
    : hasCourseOnly
    ? `Showing availability at ${selectedCourse!.name}`
    : "Build your bag by selecting clubs from each category";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Select Your Clubs</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>

      {/* Global shaft filter */}
      <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shaft:</span>
          <div className="flex gap-1">
            {SHAFT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setShaftFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  shaftFilter === key
                    ? "bg-golf-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {bags.length > 0 && (
          <div className="ml-auto">
            {!loadBagMode ? (
              <button
                onClick={() => setLoadBagMode(true)}
                className="text-sm text-golf-600 hover:text-golf-700 font-medium"
              >
                Load from saved bag
              </button>
            ) : (
              <button
                onClick={() => setLoadBagMode(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Load bag picker */}
      {loadBagMode && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select a bag to load:</h3>
          <div className="space-y-2">
            {bags.map((bag) => (
              <button
                key={bag._id}
                onClick={() => loadBag(bag.clubs as Club[])}
                className="w-full text-left p-3 rounded border border-gray-200 hover:border-golf-300 hover:bg-golf-50 transition-colors"
              >
                <span className="font-medium text-sm">{bag.setName}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(bag.clubs as Club[]).length} clubs)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: Category accordion sections */}
        <div className="flex-1 min-w-0 space-y-3">
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">Loading clubs...</div>
          ) : (
            CATEGORIES.map(({ key, label, optional }) => {
              const categoryClubs = getClubsForCategory(key);
              const allCategoryClubs = allClubs.filter((c) => assignCategory(c) === key);
              const isCollapsed = collapsed[key] ?? false;
              const selectedInCategory = allCategoryClubs.filter((c) => selectedIds.has(c._id));

              return (
                <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(key)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{label}</span>
                      {optional && (
                        <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                      )}
                      {selectedInCategory.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-golf-100 text-golf-700">
                          {selectedInCategory.length} selected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{allCategoryClubs.length} clubs</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Section body */}
                  {!isCollapsed && (
                    <div className="p-3">
                      {/* Search */}
                      <div className="relative mb-2">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder={`Search ${label.toLowerCase()} clubs...`}
                          value={getSearch(key)}
                          onChange={(e) => setSearch(key, e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-golf-400 focus:border-golf-400"
                        />
                      </div>

                      {/* Iron type sub-filter */}
                      {key === "irons" && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-400">Type:</span>
                          <div className="flex gap-1 flex-wrap">
                            {IRON_OPTIONS.map(({ key: ik, label: il }) => (
                              <button
                                key={ik}
                                type="button"
                                onClick={() => setIronTypeFilter(ik)}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                  ironTypeFilter === ik
                                    ? "bg-golf-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {il}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Club list */}
                      {categoryClubs.length === 0 ? (
                        <p className="text-xs text-gray-400 py-3 text-center">
                          {getSearch(key) ? "No clubs match your search." : "No clubs in this category."}
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {categoryClubs.map((club) => {
                            const isSelected = selectedIds.has(club._id);
                            const unavailable = !club.available;

                            return (
                              <label
                                key={club._id}
                                className={`flex items-center gap-3 py-2.5 px-1 cursor-pointer rounded transition-colors ${
                                  unavailable
                                    ? "opacity-40 cursor-not-allowed"
                                    : isSelected
                                    ? "bg-golf-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={unavailable}
                                  onChange={() => toggleClub(club)}
                                  className="rounded border-gray-300 text-golf-600 focus:ring-golf-500 flex-shrink-0"
                                />
                                {club.image && (
                                  <div className="w-8 h-7 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                    <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span className={`text-sm flex-1 min-w-0 truncate ${isSelected ? "font-medium text-gray-900" : "text-gray-700"}`}>
                                  {club.name}
                                </span>
                                {showAvailability && unavailable && (
                                  <span className="text-xs text-red-400 flex-shrink-0">
                                    {club.unavailabilityReason === "at-this-course"
                                      ? "Not at course"
                                      : "Not available"}
                                  </span>
                                )}
                                {isSelected && !unavailable && (
                                  <svg className="w-4 h-4 text-golf-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Your Bag panel */}
        <div className="w-56 flex-shrink-0 sticky top-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-golf-600 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Your Bag</h2>
              {selectedClubs.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-golf-700">
                  {selectedClubs.length}
                </span>
              )}
            </div>

            {selectedClubs.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <svg className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-xs text-gray-400">No clubs selected yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {selectedClubs.map((club) => (
                  <div key={club._id} className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{club.name}</p>
                      {club.category && (
                        <p className="text-xs text-gray-400 capitalize truncate">
                          {club.category.replace(/-/g, " ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClub(club._id)}
                      className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Save as bag toggle */}
            <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToBag}
                  onChange={(e) => setSaveToBag(e.target.checked)}
                  className="rounded border-gray-300 text-golf-600 focus:ring-golf-500"
                />
                Save as favourite bag
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
        <button
          onClick={() => navigate("/reserve/summary")}
          disabled={selectedClubs.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next ({selectedClubs.length} selected)
        </button>
      </div>
    </div>
  );
};

export default SelectClubs;
