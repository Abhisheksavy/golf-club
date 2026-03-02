import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getClubs } from "../api/clubs";
import { useClubSelection } from "../hooks/useClubSelection";
import { useFavouriteSets } from "../hooks/useFavouriteSets";
import ClubCard from "../components/ui/ClubCard";
import SelectionBar from "../components/ui/SelectionBar";
import SaveSetModal from "../components/ui/SaveSetModal";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BsGrid3X3Gap, BsTable } from "react-icons/bs";

const PAGE_SIZE = 10;

const BrowseClubs = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActive] = useState<"true" | "false" | "all">("all");
  const [archived, setArchived] = useState<"true" | "false" | "all">("all");
  const [page, setPage] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [openDropdown, setOpenDropdown] = useState<
    "status" | "archived" | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedCount, selectedClubs, toggle, clear, isSelected } =
    useClubSelection();
  const { createSet, sets } = useFavouriteSets();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["clubs", page, debouncedSearch, isActive, archived],
    queryFn: () =>
      getClubs({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        isActive,
        archived,
      }),
    placeholderData: (prev) => prev,
  });

  const clubs = data?.clubs ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  // const handleFilterChange =
  //   <T,>(setter: (v: T) => void) =>
  //   (e: React.ChangeEvent<HTMLSelectElement>) => {
  //     setter(e.target.value as T);
  //     setPage(1);
  //   };

  const handleSaveSet = (name: string) => {
    createSet(name, selectedClubs);
    clear();
    toast.success(`"${name}" saved with ${selectedClubs.length} clubs!`);
  };

  const hasFilters =
    debouncedSearch || isActive !== "all" || archived !== "all";

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-golf-yellow tracking-tight">
            Club Inventory
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Browse, filter and save sets of clubs for your rentals.
          </p>
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white/10 rounded-2xl border border-white/20 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Left side: Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FBE118] transition-all"
                />
              </div>

              {/* Filters container */}
              <div
                ref={dropdownRef}
                className="flex flex-wrap gap-2 items-center"
              >
                {/* STATUS custom dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80 font-medium whitespace-nowrap">
                    Status
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "status" ? null : "status"
                        )
                      }
                      className="flex items-center gap-2 text-sm rounded-xl border border-white/20 bg-white/10 text-white px-3 py-2 hover:bg-white/15 transition-all min-w-[90px]"
                    >
                      <span className="flex-1 text-left">
                        {isActive === "all"
                          ? "All"
                          : isActive === "true"
                          ? "Active"
                          : "Inactive"}
                      </span>
                      <svg
                        className={`w-3 h-3 text-white/60 transition-transform flex-shrink-0 ${
                          openDropdown === "status" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === "status" && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-[#1e4410] border border-white/20 rounded-xl shadow-xl overflow-hidden min-w-[110px]">
                        {[
                          { v: "all", l: "All" },
                          { v: "true", l: "Active" },
                          { v: "false", l: "Inactive" },
                        ].map(({ v, l }) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              setIsActive(v as "all" | "true" | "false");
                              setPage(1);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              isActive === v
                                ? "bg-[#FBE118]/20 text-[#FBE118] font-medium"
                                : "text-white hover:bg-white/10"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ARCHIVED custom dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80 font-medium whitespace-nowrap">
                    Archived
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "archived" ? null : "archived"
                        )
                      }
                      className="flex items-center gap-2 text-sm rounded-xl border border-white/20 bg-white/10 text-white px-3 py-2 hover:bg-white/15 transition-all min-w-[120px]"
                    >
                      <span className="flex-1 text-left">
                        {archived === "false"
                          ? "Not Archived"
                          : archived === "true"
                          ? "Archived"
                          : "All"}
                      </span>
                      <svg
                        className={`w-3 h-3 text-white/60 transition-transform flex-shrink-0 ${
                          openDropdown === "archived" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === "archived" && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-[#1e4410] border border-white/20 rounded-xl shadow-xl overflow-hidden min-w-[130px]">
                        {[
                          { v: "false", l: "Not Archived" },
                          { v: "true", l: "Archived" },
                          { v: "all", l: "All" },
                        ].map(({ v, l }) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              setArchived(v as "all" | "true" | "false");
                              setPage(1);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              archived === v
                                ? "bg-[#FBE118]/20 text-[#FBE118] font-medium"
                                : "text-white hover:bg-white/10"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setIsActive("all");
                      setArchived("all");
                      setPage(1);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Right side: View toggle */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1 flex-shrink-0">
              <button
                onClick={() => setView("grid")}
                title="Grid view"
                className={`p-2 rounded-lg transition-all ${
                  view === "grid"
                    ? "bg-white/20 text-golf-yellow"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <BsGrid3X3Gap className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("table")}
                title="Table view"
                className={`p-2 rounded-lg transition-all ${
                  view === "table"
                    ? "bg-white/20 text-golf-yellow"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <BsTable className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Results count + selection summary ── */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/60">
              <span className="font-semibold text-white">{total}</span> club
              {total !== 1 ? "s" : ""} found
            </p>
            {selectedCount > 0 && (
              <p className="text-sm text-golf-yellow font-medium">
                {selectedCount} selected
              </p>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-[#FBE118] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-white/60">Loading clubs...</p>
            </div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/20">
            <svg
              className="w-12 h-12 text-white/20 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-white/40 text-sm font-medium">No clubs found</p>
            <p className="text-white/30 text-xs mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : view === "grid" ? (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clubs.map((club) => (
              <ClubCard
                key={club._id}
                club={club}
                isSelected={isSelected(club._id)}
                onToggle={toggle}
                view="grid"
              />
            ))}
          </div>
        ) : (
          /* ── TABLE VIEW ── */
          <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="w-10 pl-4 pr-2 py-3" />
                    <th className="py-3 pr-4 w-16" />
                    <th className="py-3 pr-4 text-xs font-semibold text-white uppercase tracking-wide">
                      Name / SKU
                    </th>
                    <th className="py-3 pr-4 text-xs font-semibold text-white uppercase tracking-wide hidden sm:table-cell">
                      Type
                    </th>
                    <th className="py-3 pr-4 text-xs font-semibold text-white uppercase tracking-wide hidden md:table-cell">
                      Tracking
                    </th>
                    <th className="py-3 pr-4 text-xs font-semibold text-white uppercase tracking-wide text-right hidden sm:table-cell">
                      Price
                    </th>
                    <th className="py-3 pr-4 text-xs font-semibold text-white uppercase tracking-wide text-center hidden lg:table-cell">
                      Status
                    </th>
                    <th className="py-3 pr-4 text-xs font-semibold text-white uppercase tracking-wide text-center hidden lg:table-cell">
                      Archived
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <ClubCard
                      key={club._id}
                      club={club}
                      isSelected={isSelected(club._id)}
                      onToggle={toggle}
                      view="table"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-white/60">
              Showing{" "}
              <span className="font-medium text-white">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of <span className="font-medium text-white">{total}</span> clubs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/20 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
              >
                <IoIosArrowBack className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 flex items-center justify-center text-white/40 text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-8 h-8 rounded-xl border text-sm font-medium transition-all ${
                        page === item
                          ? "bg-[#FBE118] text-[#285610] border-[#FBE118]"
                          : "border-white/20 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/20 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
              >
                <IoIosArrowForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <SelectionBar
        count={selectedCount}
        onSave={() => setShowSaveModal(true)}
        onClear={clear}
      />
      <SaveSetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSet}
        existingNames={sets.map((s) => s.setName)}
      />
      {selectedCount > 0 && <div className="h-16" />}
    </>
  );
};

export default BrowseClubs;
