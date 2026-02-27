import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getClubs } from "../api/clubs";
import {
  useFavouriteSets,
  useFavouriteSetDetail,
} from "../hooks/useFavouriteSets";
import ClubCard from "../components/ui/ClubCard";
import type { Club } from "../types";

const AddClubsPage = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { updateSetClubs } = useFavouriteSets();

  const [pendingClubs, setPendingClubs] = useState<Set<string>>(new Set());

  const { data: set, isLoading: setLoading } = useFavouriteSetDetail(
    setId || ""
  );

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
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
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

      {availableClubs.length === 0 ? (
        <div className="bg-white/10 rounded-lg border border-white/20 p-8 text-center">
          <p className="text-white/60">All clubs are already in this bag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {availableClubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              isSelected={pendingClubs.has(club._id)}
              onToggle={handleToggle}
              view="grid"
            />
          ))}
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
