import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getClubs } from "../api/clubs";
import {
  useFavouriteSets,
  useFavouriteSetDetail,
} from "../hooks/useFavouriteSets";
import type { Club } from "../types";

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

function assignCategory(club: Club): CategoryKey {
  if (!club.category) return "other";
  const known: CategoryKey[] = ["driver", "fairway-woods-hybrids", "irons", "wedges", "putter"];
  return known.includes(club.category as CategoryKey)
    ? (club.category as CategoryKey)
    : "other";
}

const AddClubsPage = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { updateSetClubs } = useFavouriteSets();

  const [pendingClubs, setPendingClubs] = useState<Set<string>>(new Set());
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [shaftFilter, setShaftFilter] = useState("all");
  const [ironTypeFilter, setIronTypeFilter] = useState("all");
  const [categorySearch, setCategorySearch] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { data: set, isLoading: setLoading } = useFavouriteSetDetail(setId || "");

  const { data: allClubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ["clubs", { limit: 100 }],
    queryFn: () => getClubs({ limit: 100 }),
  });

  const allClubs = allClubsData?.clubs ?? [];
  const setClubs = (set?.clubs ?? []) as Club[];
  const setClubIds = new Set(setClubs.map((c) => c._id));
  const availableClubs = allClubs.filter((c) => !setClubIds.has(c._id));

  const isLoading = setLoading || clubsLoading;

  const handleToggle = (club: Club) => {
    setPendingClubs((prev) => {
      const next = new Set(prev);
      next.has(club._id) ? next.delete(club._id) : next.add(club._id);
      return next;
    });
  };

  const handleDone = () => {
    const toAdd = availableClubs.filter((c) => pendingClubs.has(c._id));
    if (toAdd.length > 0) {
      updateSetClubs(set!._id, [...setClubs, ...toAdd]);
      toast.success(`${toAdd.length} club${toAdd.length > 1 ? "s" : ""} added`);
    }
    navigate(`/my-bags/${setId}`);
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSearch = (key: string) => categorySearch[key] ?? "";
  const setSearch = (key: string, val: string) =>
    setCategorySearch((prev) => ({ ...prev, [key]: val }));

  const getClubsForCategory = (key: CategoryKey): Club[] => {
    let clubs = availableClubs.filter((c) => assignCategory(c) === key);

    if (key !== "putter" && key !== "other" && shaftFilter !== "all") {
      clubs = clubs.filter((c) => (c as any).shaftType === shaftFilter);
    }
    if (key === "irons" && ironTypeFilter !== "all") {
      clubs = clubs.filter((c) => (c as any).ironType === ironTypeFilter);
    }

    const q = getSearch(key).toLowerCase().trim();
    if (q) {
      clubs = clubs.filter((c) => c.name.toLowerCase().includes(q));
    }

    return clubs;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-golf-yellow">
        Loading...
      </div>
    );
  }

  if (!set) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Bag not found</h2>
        <button onClick={() => navigate("/my-bags")} className="btn-primary">
          Back to My Bags
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate(`/my-bags/${setId}`)}
        className="text-sm text-golf-yellow hover:text-golf-yellow/80 mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {set.setName}
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-golf-yellow">Add Clubs</h1>
        <p className="text-white/60 text-sm mt-1">
          Select clubs to add to <span className="text-white font-medium">{set.setName}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4 pb-4 border-b border-white/20">
        {/* Gender + Height */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Gender:</span>
            <div className="flex gap-1">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    gender === g ? "bg-[#FBE118] text-[#285610]" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Height:</span>
            <select
              value={height || ""}
              onChange={(e) => setHeight(e.target.value)}
              className="text-xs bg-white/10 border border-white/20 text-white rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FBE118]"
            >
              <option value="">Select height</option>
              {(gender === "female" ? FEMALE_HEIGHTS : MALE_HEIGHTS).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shaft + Iron type */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Shaft:</span>
            <div className="flex gap-1">
              {SHAFT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setShaftFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    shaftFilter === key ? "bg-[#FBE118] text-[#285610]" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70 uppercase tracking-wide">Iron Type:</span>
            <div className="flex gap-1 flex-wrap">
              {IRON_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIronTypeFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    ironTypeFilter === key ? "bg-[#FBE118] text-[#285610]" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {availableClubs.length === 0 ? (
        <div className="bg-white/10 rounded-lg border border-white/20 p-8 text-center">
          <p className="text-white/60">All clubs are already in this bag.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {CATEGORIES.map(({ key, label, optional }) => {
            const categoryClubs = getClubsForCategory(key);
            const allCategoryClubs = availableClubs.filter((c) => assignCategory(c) === key);
            const isCollapsed = collapsed[key] ?? false;
            const selectedInCategory = allCategoryClubs.filter((c) => pendingClubs.has(c._id));

            return (
              <div key={key} className="bg-white/10 rounded-lg border border-white/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCollapse(key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/15 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-golf-yellow text-sm">{label}</span>
                    {optional && (
                      <span className="text-xs text-white/50 font-normal">(Optional)</span>
                    )}
                    {selectedInCategory.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FBE118] text-[#285610]">
                        {selectedInCategory.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">{allCategoryClubs.length} clubs</span>
                    <svg
                      className={`w-4 h-4 text-white/50 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-3">
                    <div className="relative mb-2">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder={`Search ${label.toLowerCase()} clubs...`}
                        value={getSearch(key)}
                        onChange={(e) => setSearch(key, e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-white/20 rounded-md bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FBE118] focus:border-[#FBE118]"
                      />
                    </div>

                    {categoryClubs.length === 0 ? (
                      <p className="text-xs text-white/40 py-3 text-center">
                        {getSearch(key) ? "No clubs match your search." : "No clubs in this category."}
                      </p>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {categoryClubs.map((club) => {
                          const isSelected = pendingClubs.has(club._id);
                          return (
                            <label
                              key={club._id}
                              className={`flex items-center gap-3 py-2 px-1 cursor-pointer rounded transition-colors ${
                                isSelected ? "bg-white/15" : "hover:bg-white/10"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggle(club)}
                                className="rounded border-white/30 text-golf-yellow focus:ring-[#FBE118] flex-shrink-0 bg-white/10"
                              />
                              {club.image && (
                                <div className="w-20 h-16 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                                  <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className={`text-sm flex-1 min-w-0 truncate ${isSelected ? "font-medium text-white" : "text-white/80"}`}>
                                {club.name}
                              </span>
                              {isSelected && (
                                <svg className="w-4 h-4 text-golf-yellow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
          })}
        </div>
      )}

      {/* Footer action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e4410] border-t border-[#FBE118]/20 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-white/70">
          {pendingClubs.size > 0
            ? `${pendingClubs.size} club${pendingClubs.size > 1 ? "s" : ""} selected`
            : "Select clubs to add"}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/my-bags/${setId}`)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={pendingClubs.size === 0}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Done ({pendingClubs.size})
          </button>
        </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20" />
    </div>
  );
};

export default AddClubsPage;
