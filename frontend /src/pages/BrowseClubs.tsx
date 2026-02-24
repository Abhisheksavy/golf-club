// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { getClubs } from "../api/clubs";
// import { useClubSelection } from "../hooks/useClubSelection";
// import { useFavouriteSets } from "../hooks/useFavouriteSets";
// import ClubCard from "../components/ui/ClubCard";
// import SelectionBar from "../components/ui/SelectionBar";
// import SaveSetModal from "../components/ui/SaveSetModal";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// const PAGE_SIZE = 10;

// const BrowseClubs = () => {
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [isActive, setIsActive] = useState<"true" | "false" | "all">("all");
//   const [archived, setArchived] = useState<"true" | "false" | "all">("all");
//   const [page, setPage] = useState(1);
//   const [showSaveModal, setShowSaveModal] = useState(false);

//   const { selectedCount, selectedClubs, toggle, clear, isSelected } =
//     useClubSelection();
//   const { createSet } = useFavouriteSets();

//   // Debounce search — wait 400ms after user stops typing
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//       setPage(1);
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [search]);

//   const { data, isLoading } = useQuery({
//     queryKey: ["clubs", page, debouncedSearch, isActive, archived],
//     queryFn: () =>
//       getClubs({
//         page,
//         limit: PAGE_SIZE,
//         search: debouncedSearch || undefined,
//         isActive,
//         archived,
//       }),
//     placeholderData: (prev) => prev,
//   });

//   const clubs = data?.clubs ?? [];
//   const totalPages = data?.totalPages ?? 1;
//   const total = data?.total ?? 0;

//   const handleFilterChange =
//     <T,>(setter: (v: T) => void) =>
//     (e: React.ChangeEvent<HTMLSelectElement>) => {
//       setter(e.target.value as T);
//       setPage(1);
//     };

//   const handleSaveSet = (name: string) => {
//     createSet(name, selectedClubs);
//     clear();
//     toast.success(`"${name}" saved with ${selectedClubs.length} clubs!`);
//   };

//   return (
//     <>
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         {/* Header row */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
//           <h1 className="text-2xl font-bold text-gray-900">Browse Clubs</h1>
//           <input
//             type="text"
//             placeholder="Search by name..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="input-field sm:max-w-xs"
//           />
//         </div>

//         {/* Filter row */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           <div className="flex items-center gap-2">
//             <label className="text-sm text-gray-600 font-medium">Status</label>
//             <select
//               value={isActive}
//               onChange={handleFilterChange<"true" | "false" | "all">(
//                 setIsActive
//               )}
//               className="input-field py-1 text-sm"
//             >
//               <option value="all">All</option>
//               <option value="true">Active</option>
//               <option value="false">Inactive</option>
//             </select>
//           </div>

//           <div className="flex items-center gap-2">
//             <label className="text-sm text-gray-600 font-medium">
//               Archived
//             </label>
//             <select
//               value={archived}
//               onChange={handleFilterChange<"true" | "false" | "all">(
//                 setArchived
//               )}
//               className="input-field py-1 text-sm"
//             >
//               <option value="false">Not Archived</option>
//               <option value="true">Archived</option>
//               <option value="all">All</option>
//             </select>
//           </div>

//           {(debouncedSearch || isActive !== "all" || archived !== "all") && (
//             <button
//               onClick={() => {
//                 setSearch("");
//                 setIsActive("all");
//                 setArchived("all");
//                 setPage(1);
//               }}
//               className="text-sm text-red-500 hover:underline"
//             >
//               Clear filters
//             </button>
//           )}
//         </div>

//         {/* Results count */}
//         {!isLoading && (
//           <p className="text-sm text-gray-500 mb-4">
//             {total} club{total !== 1 ? "s" : ""} found
//           </p>
//         )}

//         {/* Grid */}
//         {isLoading ? (
//           <div className="text-center py-12 text-gray-500">
//             Loading clubs...
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {clubs.map((club) => (
//               <ClubCard
//                 key={club._id}
//                 club={club}
//                 isSelected={isSelected(club._id)}
//                 onToggle={toggle}
//               />
//             ))}
//           </div>
//         )}

//         {!isLoading && clubs.length === 0 && (
//           <p className="text-center text-gray-500 py-12">No clubs found</p>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between mt-8">
//             <p className="text-sm text-gray-500">
//               Showing {(page - 1) * PAGE_SIZE + 1}–
//               {Math.min(page * PAGE_SIZE, total)} of {total} clubs
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage((p) => p - 1)}
//                 disabled={page === 1}
//                 className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
//               >
//                 <IoIosArrowBack />
//               </button>

//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter(
//                   (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
//                 )
//                 .reduce<(number | "...")[]>((acc, p, idx, arr) => {
//                   if (idx > 0 && p - (arr[idx - 1] as number) > 1)
//                     acc.push("...");
//                   acc.push(p);
//                   return acc;
//                 }, [])
//                 .map((item, idx) =>
//                   item === "..." ? (
//                     <span
//                       key={`ellipsis-${idx}`}
//                       className="px-2 text-gray-400"
//                     >
//                       …
//                     </span>
//                   ) : (
//                     <button
//                       key={item}
//                       onClick={() => setPage(item as number)}
//                       className={`px-3 py-1 rounded border text-sm ${
//                         page === item
//                           ? "bg-green-600 text-white border-green-600"
//                           : "hover:bg-gray-100"
//                       }`}
//                     >
//                       {item}
//                     </button>
//                   )
//                 )}

//               <button
//                 onClick={() => setPage((p) => p + 1)}
//                 disabled={page === totalPages}
//                 className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
//               >
//                 <IoIosArrowForward />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <SelectionBar
//         count={selectedCount}
//         onSave={() => setShowSaveModal(true)}
//         onClear={clear}
//       />

//       <SaveSetModal
//         isOpen={showSaveModal}
//         onClose={() => setShowSaveModal(false)}
//         onSave={handleSaveSet}
//       />

//       {selectedCount > 0 && <div className="h-16" />}
//     </>
//   );
// };

// export default BrowseClubs;


import { useState, useEffect } from "react";
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

  const { selectedCount, selectedClubs, toggle, clear, isSelected } = useClubSelection();
  const { createSet, sets } = useFavouriteSets();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["clubs", page, debouncedSearch, isActive, archived],
    queryFn: () =>
      getClubs({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined, isActive, archived }),
    placeholderData: (prev) => prev,
  });

  const clubs = data?.clubs ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleFilterChange =
    <T,>(setter: (v: T) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value as T);
      setPage(1);
    };

  const handleSaveSet = (name: string) => {
    createSet(name, selectedClubs);
    clear();
    toast.success(`"${name}" saved with ${selectedClubs.length} clubs!`);
  };

  const hasFilters = debouncedSearch || isActive !== "all" || archived !== "all";

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Page Header ── */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Club Inventory</h1>
            <p className="text-slate-500 mt-1 text-sm">Browse, filter and save sets of clubs for your rentals.</p>
          </div>

          {/* ── Toolbar ── */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Status</label>
                  <select
                    value={isActive}
                    onChange={handleFilterChange<"true" | "false" | "all">(setIsActive)}
                    className="text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  >
                    <option value="all">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Archived</label>
                  <select
                    value={archived}
                    onChange={handleFilterChange<"true" | "false" | "all">(setArchived)}
                    className="text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  >
                    <option value="false">Not Archived</option>
                    <option value="true">Archived</option>
                    <option value="all">All</option>
                  </select>
                </div>

                {hasFilters && (
                  <button
                    onClick={() => { setSearch(""); setIsActive("all"); setArchived("all"); setPage(1); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1 hidden sm:block" />

              {/* View toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setView("grid")}
                  title="Grid view"
                  className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white shadow text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <BsGrid3X3Gap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("table")}
                  title="Table view"
                  className={`p-2 rounded-lg transition-all ${view === "table" ? "bg-white shadow text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <BsTable className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Results count + selection summary ── */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{total}</span> club{total !== 1 ? "s" : ""} found
              </p>
              {selectedCount > 0 && (
                <p className="text-sm text-emerald-600 font-medium">
                  {selectedCount} selected
                </p>
              )}
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading clubs...</p>
              </div>
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-slate-200">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-400 text-sm font-medium">No clubs found</p>
              <p className="text-slate-300 text-xs mt-1">Try adjusting your search or filters</p>
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
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="w-10 pl-4 pr-2 py-3" />
                      <th className="py-3 pr-4 w-16" />
                      <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name / SKU</th>
                      <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                      <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Tracking</th>
                      <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right hidden sm:table-cell">Price</th>
                      <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center hidden lg:table-cell">Status</th>
                      <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center hidden lg:table-cell">Archived</th>
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
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-medium text-slate-700">{total}</span> clubs
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <IoIosArrowBack className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="w-8 flex items-center justify-center text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`w-8 h-8 rounded-xl border text-sm font-medium transition-all ${
                          page === item
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <IoIosArrowForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SelectionBar count={selectedCount} onSave={() => setShowSaveModal(true)} onClear={clear} />
      <SaveSetModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} onSave={handleSaveSet} existingNames={sets.map((s) => s.setName)} />
      {selectedCount > 0 && <div className="h-16" />}
    </>
  );
};

export default BrowseClubs;