import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getClubs } from "../api/clubs";
import { createFavourite } from "../api/favourites";
import { isAuthenticated } from "../hooks/useAuth";
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

const NewBagPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [shaftFilter, setShaftFilter] = useState("all");
  const [ironTypeFilter, setIronTypeFilter] = useState("all");
  const [categorySearch, setCategorySearch] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedClubs, setSelectedClubs] = useState<Club[]>([]);
  const [bagName, setBagName] = useState("");

  const { data: allClubsData, isLoading } = useQuery({
    queryKey: ["clubs", { limit: 100 }],
    queryFn: () => getClubs({ limit: 100 }),
  });

  const allClubs = allClubsData?.clubs ?? [];
  const selectedIds = new Set(selectedClubs.map((c) => c._id));

  const saveMutation = useMutation({
    mutationFn: ({ name, clubs }: { name: string; clubs: string[] }) =>
      createFavourite(name, clubs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
      toast.success("Bag saved!");
      navigate("/my-bags");
    },
    onError: () => {
      toast.error("Failed to save bag. Please try again.");
    },
  });

  const toggleClub = (club: Club) => {
    if (selectedIds.has(club._id)) {
      setSelectedClubs(selectedClubs.filter((c) => c._id !== club._id));
    } else {
      setSelectedClubs([...selectedClubs, club]);
    }
  };

  const removeClub = (clubId: string) => {
    setSelectedClubs(selectedClubs.filter((c) => c._id !== clubId));
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSearch = (key: string) => categorySearch[key] ?? "";
  const setSearch = (key: string, val: string) =>
    setCategorySearch((prev) => ({ ...prev, [key]: val }));

  const getClubsForCategory = (key: CategoryKey): Club[] => {
    let clubs = allClubs.filter((c) => assignCategory(c) === key);

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

  const handleSaveBag = () => {
    if (!isAuthenticated()) {
      sessionStorage.setItem("returnTo", "/my-bags/new");
      navigate("/login");
      return;
    }
    const now = new Date();
    const name = bagName.trim() || `My Bag — ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    saveMutation.mutate({ name, clubs: selectedClubs.map((c) => c._id) });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/my-bags")}
        className="text-sm text-golf-yellow hover:text-golf-yellow/80 mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Bags
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-golf-yellow">Build Your Bag</h1>
        <p className="text-white/60 text-sm mt-1">Select clubs and save them as a named bag.</p>
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

      {/* Two-column layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        {/* Left: Category accordion */}
        <div className="flex-1 min-w-0 space-y-3">
          {isLoading ? (
            <div className="text-center py-16 text-golf-yellow">Loading clubs...</div>
          ) : (
            CATEGORIES.map(({ key, label, optional }) => {
              const categoryClubs = getClubsForCategory(key);
              const allCategoryClubs = allClubs.filter((c) => assignCategory(c) === key);
              const isCollapsed = collapsed[key] ?? false;
              const selectedInCategory = allCategoryClubs.filter((c) => selectedIds.has(c._id));

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
                            const isSelected = selectedIds.has(club._id);
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
                                  onChange={() => toggleClub(club)}
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
            })
          )}
        </div>

        {/* Right: Your Bag panel */}
        <div className="w-full lg:w-56 lg:flex-shrink-0 lg:sticky lg:top-4">
          <div className="bg-white/10 rounded-lg border border-white/20 overflow-hidden">
            <div className="px-4 py-3 bg-[#FBE118] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#285610]">Your Bag</h2>
              {selectedClubs.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-golf-dark text-golf-yellow">
                  {selectedClubs.length}
                </span>
              )}
            </div>

            {selectedClubs.length === 0 ? (
              <div className="px-4 py-4 lg:py-6 flex items-center gap-3 lg:flex-col lg:text-center">
                <svg
                  className="w-7 h-7 lg:w-8 lg:h-8 text-white/20 lg:mx-auto lg:mb-2 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-xs text-white/40">No clubs selected yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10 max-h-48 lg:max-h-80 overflow-y-auto">
                {selectedClubs.map((club) => (
                  <div key={club._id} className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{club.name}</p>
                      {club.category && (
                        <p className="text-xs text-white/50 capitalize truncate">
                          {club.category.replace(/-/g, " ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClub(club._id)}
                      className="flex-shrink-0 text-white/30 hover:text-red-400 transition-colors"
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
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e4410] border-t border-[#FBE118]/20 px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          placeholder="Name your bag..."
          value={bagName}
          onChange={(e) => setBagName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-white/20 rounded-md bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FBE118] focus:border-[#FBE118]"
        />
        <button
          onClick={handleSaveBag}
          disabled={saveMutation.isPending || selectedClubs.length === 0}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {saveMutation.isPending ? "Saving..." : "Save Bag"}
        </button>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20" />
    </div>
  );
};

export default NewBagPage;
