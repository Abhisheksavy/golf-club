import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFavouriteSets } from "../hooks/useFavouriteSets";
import FavouriteSetCard from "../components/ui/FavouriteSetCard";
import ConfirmModal from "../components/ui/ConfirmModal";

const PAGE_SIZE = 10;

const FavouriteSets = () => {
  const [page, setPage] = useState(1);
  const { sets, total, totalPages, isLoading, deleteSet } = useFavouriteSets(page, PAGE_SIZE);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteTarget) {
      const name = sets.find((s) => s._id === deleteTarget)?.setName;
      deleteSet(deleteTarget);
      toast.success(`"${name}" deleted`);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading your bags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              My Bags
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {total > 0
                ? `${total} saved bag${total !== 1 ? "s" : ""}`
                : "Save your favourite club combinations"}
            </p>
          </div>
          <Link
            to="/browse-clubs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Bag
          </Link>
        </div>

        {sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl ring-1 ring-slate-200">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-slate-700 font-semibold text-lg mb-1">
              No bags yet
            </h3>
            <p className="text-slate-400 text-sm text-center max-w-xs mb-6">
              Browse clubs and save your favourite combinations into a bag for
              quick access.
            </p>
            <Link
              to="/browse-clubs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Browse Clubs
            </Link>
          </div>
        ) : (
          <>
            {/* ── Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sets.map((set) => (
                <FavouriteSetCard
                  key={set._id}
                  set={set}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                  </span>{" "}
                  of <span className="font-medium text-slate-700">{total}</span> bags
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    ‹
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
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Set"
        message="Are you sure you want to delete this favourite set? This action cannot be undone."
      />
    </div>
  );
};

export default FavouriteSets;
