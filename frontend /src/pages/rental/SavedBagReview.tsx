import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getClubs, getAvailableClubs, getCollections } from "../../api/clubs";
import type { Club, AvailableClub } from "../../types";
import ClubSelectCard from "../../components/ui/ClubSelectCard";

type CategoryKey = string;

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

const MALE_HEIGHTS = [
  "5'4\" and under (Length-1)",
  "5'4\" to 5'7\" (Length-1/2)",
  "5'7\" to 6'0\" (Standard Length)",
  "6'0\" to 6'4\" (Length+1/2)",
  "6'4\" and over (Length+1)",
];
const FEMALE_HEIGHTS = [
  "5'0\" and under (Length-1)",
  "5'0\" to 5'3\" (Length-1/2)",
  "5'3\" to 5'7\" (Standard Length)",
  "5'7\" to 6'0\" (Length+1/2)",
  "6'0\" and over (Length+1)",
];

function assignCategory(club: Club): string {
  return club.category ?? "other";
}

const SavedBagReview = () => {
  const navigate = useNavigate();
  const {
    selectedCourse,
    selectedDate,
    selectedClubs,
    setClubs,
    gender,
    setGender,
    height,
    setHeight,
    swingStrength,
    playingLevel,
  } = useRental();

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
  const [categorySearch, setCategorySearch] = useState<Record<string, string>>(
    {}
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { data: collectionsData } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  const categories = [...(collectionsData ?? []), { key: "other", label: "Other" }];

  const hasCourseAndDate = !!(selectedCourse && selectedDate);
  const hasCourseOnly = !!(selectedCourse && !selectedDate);

  // Fetch available clubs with availability data
  const { data: availableClubsData = [], isLoading: availableLoading } =
    useQuery({
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

  const isLoading = hasCourseAndDate
    ? availableLoading
    : hasCourseOnly
    ? courseLoading
    : allLoading;

  const allClubs: AvailableClub[] = hasCourseAndDate
    ? availableClubsData
    : hasCourseOnly
    ? courseClubsData
    : (allClubsData?.clubs ?? []).map((c) => ({ ...c, available: true }));

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

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSearch = (key: string) => categorySearch[key] ?? "";
  const setSearch = (key: string, val: string) =>
    setCategorySearch((prev) => ({ ...prev, [key]: val }));

  const getClubsForCategory = (key: CategoryKey): AvailableClub[] => {
    let clubs = allClubs.filter((c) => assignCategory(c) === key);

    if (key !== "putter" && key !== "other" && shaftFilter !== "all") {
      clubs = clubs.filter((c) => c.shaftType === shaftFilter);
    }
    if (key === "irons" && ironTypeFilter !== "all") {
      clubs = clubs.filter((c) => c.ironType === ironTypeFilter);
    }

    const q = getSearch(key).toLowerCase().trim();
    if (q) {
      clubs = clubs.filter((c) => c.name.toLowerCase().includes(q));
    }

    return clubs;
  };

  const showAvailability = hasCourseAndDate || hasCourseOnly;

  // Count unavailable selected clubs
  const unavailableSelectedCount = selectedClubs.filter((sc) => {
    const found = allClubs.find((c) => c._id === sc._id);
    return found && !found.available;
  }).length;

  if (selectedClubs.length === 0) {
    navigate("/reserve/bag-select", { replace: true });
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-golf-yellow mb-1">
          Review Saved Bag
        </h1>
        <p className="text-golf-yellow text-sm">
          {hasCourseAndDate
            ? `Availability shown for ${selectedCourse!.name} on ${new Date(
                selectedDate!
              ).toLocaleDateString()}.`
            : hasCourseOnly
            ? `Availability shown for ${selectedCourse!.name}.`
            : "Review and adjust your club selections."}
        </p>
      </div>

      {/* Availability warning */}
      {showAvailability && unavailableSelectedCount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-amber-700">
            {unavailableSelectedCount} club
            {unavailableSelectedCount > 1 ? "s" : ""} in your bag{" "}
            {unavailableSelectedCount > 1 ? "are" : "is"} unavailable — you can
            swap them below.
          </p>
        </div>
      )}

      {/* Height/Gender filter */}
      <div className="flex flex-wrap gap-4 mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-golf-yellow uppercase tracking-wide">
            Gender:
          </span>
          <div className="flex gap-1">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  gender === g
                    ? "bg-[#FBE118] text-[#285610]"
                    : "bg-white/10 text-golf-yellow hover:bg-white/20"
                }`}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-golf-yellow uppercase tracking-wide">
            Height:
          </span>
          <select
            value={height || ""}
            onChange={(e) => setHeight(e.target.value)}
            className="text-xs bg-white/10 border border-white/20 text-golf-yellow rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FBE118]"
          >
            <option value="">Select height</option>
            {(gender === "female" ? FEMALE_HEIGHTS : MALE_HEIGHTS).map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shaft filter */}
      <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-golf-yellow uppercase tracking-wide">
            Shaft:
          </span>
          <div className="flex gap-1">
            {SHAFT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setShaftFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  shaftFilter === key
                    ? "bg-[#FBE118] text-[#285610]"
                    : "bg-white/10 text-golf-yellow hover:bg-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Your Bag — compact bar */}
      <div className="mb-4 bg-white/10 rounded-lg border border-white/20 overflow-hidden">
        <div className="px-4 py-2 bg-[#FBE118] flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#285610] shrink-0">
            Your Bag
          </h2>
          {selectedClubs.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-golf-dark text-golf-yellow shrink-0">
              {selectedClubs.length}
            </span>
          )}
        </div>
        {selectedClubs.length === 0 ? (
          <p className="text-xs text-white/40 px-4 py-3">No clubs selected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 px-4 py-3">
            {selectedClubs.map((club) => {
              const liveClub = allClubs.find((c) => c._id === club._id);
              const isUnavailable = liveClub && !liveClub.available;
              return (
                <span
                  key={club._id}
                  className={`inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full text-xs font-medium border ${
                    isUnavailable
                      ? "bg-red-900/30 border-red-500/40 text-red-300"
                      : "bg-white/10 border-white/20 text-golf-yellow"
                  }`}
                >
                  {club.name}
                  {isUnavailable && (
                    <span className="text-[10px] text-red-400 font-normal">(unavailable)</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeClub(club._id)}
                    className="text-white/40 hover:text-red-400 transition-colors ml-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-width accordion */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 text-golf-yellow">Loading clubs...</div>
        ) : (
          categories.map(({ key, label }) => {
            const categoryClubs = getClubsForCategory(key);
            const allCategoryClubs = allClubs.filter(
              (c) => assignCategory(c) === key
            );
            const isCollapsed = collapsed[key] ?? false;
            const selectedInCategory = allCategoryClubs.filter((c) =>
              selectedIds.has(c._id)
            );

            return (
              <div
                key={key}
                className="bg-white/10 rounded-lg border border-white/20 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleCollapse(key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/15 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-golf-yellow text-sm">{label}</span>
                    {selectedInCategory.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FBE118] text-[#285610]">
                        {selectedInCategory.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-golf-yellow">{allCategoryClubs.length} clubs</span>
                    <svg
                      className={`w-4 h-4 text-golf-yellow transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-4">
                    <div className="relative mb-3">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-golf-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder={`Search ${label.toLowerCase()} clubs...`}
                        value={getSearch(key)}
                        onChange={(e) => setSearch(key, e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-white/20 rounded-md bg-white/10 text-golf-yellow placeholder-golf-yellow focus:outline-none focus:ring-1 focus:ring-[#FBE118] focus:border-[#FBE118]"
                      />
                    </div>

                    {key === "irons" && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-golf-yellow">Type:</span>
                        <div className="flex gap-1 flex-wrap">
                          {IRON_OPTIONS.map(({ key: ik, label: il }) => (
                            <button
                              key={ik}
                              type="button"
                              onClick={() => setIronTypeFilter(ik)}
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                ironTypeFilter === ik
                                  ? "bg-[#FBE118] text-[#285610]"
                                  : "bg-white/10 text-golf-yellow hover:bg-white/20"
                              }`}
                            >
                              {il}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoryClubs.length === 0 ? (
                      <p className="text-xs text-golf-yellow py-3 text-center">
                        {getSearch(key) ? "No clubs match your search." : "No clubs in this category."}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {categoryClubs.map((club) => {
                          const isSelected = selectedIds.has(club._id);
                          const unavailable = !club.available;

                          return (
                            <ClubSelectCard
                              key={club._id}
                              club={club}
                              isSelected={isSelected}
                              onToggle={toggleClub}
                              unavailable={unavailable}
                              unavailabilityReason={club.unavailabilityReason}
                              showAvailability={showAvailability}
                            />
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
          Continue ({selectedClubs.length} selected)
        </button>
      </div>
    </div>
  );
};

export default SavedBagReview;
