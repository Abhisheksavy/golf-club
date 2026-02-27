import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFavouriteSets } from "../hooks/useFavouriteSets";
import FavouriteSetCard from "../components/ui/FavouriteSetCard";
import ConfirmModal from "../components/ui/ConfirmModal";

const PAGE_SIZE = 10;

const FavouriteSets = () => {
  const [page, setPage] = useState(1);
  const { sets, total, totalPages, isLoading, deleteSet } = useFavouriteSets(
    page,
    PAGE_SIZE
  );
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-[#FBE118] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-charcoal">Loading your bags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-golf-yellow tracking-tight">
            My Bags
          </h1>
          <p className="text-charcoal text-sm mt-1">
            {total > 0
              ? `${total} saved bag${total !== 1 ? "s" : ""}`
              : "Save your favourite club combinations"}
          </p>
        </div>
        <Link
          to="/browse-clubs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FBE118] hover:bg-[#FBE118]/90 text-[#285610] text-sm font-semibold rounded-xl transition-all"
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
        <div className="flex flex-col items-center justify-center py-24 bg-white/10 rounded-2xl border border-white/20">
          <div className="w-16 h-16 bg-[#FBE118]/20 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-golf-yellow"
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
          <h3 className="text-white font-semibold text-lg mb-1">No bags yet</h3>
          <p className="text-white/50 text-sm text-center max-w-xs mb-6">
            Browse clubs and save your favourite combinations into a bag for
            quick access.
          </p>
          <Link
            to="/browse-clubs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FBE118] hover:bg-[#FBE118]/90 text-[#285610] text-sm font-semibold rounded-xl transition-colors"
          >
            Browse Clubs
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sets.map((set) => (
              <FavouriteSetCard
                key={set._id}
                set={set}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-white/60">
                Showing{" "}
                <span className="font-medium text-white">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)}
                </span>{" "}
                of <span className="font-medium text-white">{total}</span> bags
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/20 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1
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
                        key={`e-${idx}`}
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
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
