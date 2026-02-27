import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Club } from "../types";
import {
  useFavouriteSets,
  useFavouriteSetDetail,
} from "../hooks/useFavouriteSets";
import SaveSetModal from "../components/ui/SaveSetModal";
import ConfirmModal from "../components/ui/ConfirmModal";

const FavouriteSetDetail = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { renameSet, updateSetClubs, deleteSet, sets } = useFavouriteSets();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: set, isLoading } = useFavouriteSetDetail(setId || "");

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-charcoal">
        Loading...
      </div>
    );
  }

  if (!set) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-golf-yellow mb-2">
          Bag not found
        </h2>
        <p className="text-charcoal mb-4">
          This favourite bag doesn't exist or was deleted.
        </p>
        <button onClick={() => navigate("/my-bags")} className="btn-primary">
          Back to My Bags
        </button>
      </div>
    );
  }

  const setClubs = set.clubs as Club[];

  const handleRemoveClub = (clubId: string) => {
    const updated = setClubs.filter((c) => c._id !== clubId);
    updateSetClubs(set._id, updated);
    toast.success("Club removed");
  };

  const handleRename = (newName: string) => {
    renameSet(set._id, newName);
    toast.success(`Renamed to "${newName}"`);
  };

  const handleDelete = () => {
    deleteSet(set._id);
    toast.success(`"${set.setName}" deleted`);
    navigate("/my-bags");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/my-bags")}
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
        Back to My Bags
      </button>

      {/* Set info card */}
      <div className="bg-white/10 rounded-lg border border-white/20 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-golf-yellow">
              {set.setName}
            </h1>
            <p className="text-sm text-charcoal mt-1">
              {setClubs.length} {setClubs.length === 1 ? "club" : "clubs"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRenameModal(true)}
              className="btn-secondary text-sm"
            >
              Rename
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Clubs in this set */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-golf-yellow">
          Clubs in this Bag
        </h2>
        <button
          onClick={() => navigate(`/my-bags/${setId}/add-clubs`)}
          className="btn-primary text-sm"
        >
          + Add Clubs
        </button>
      </div>

      {setClubs.length === 0 ? (
        <div className="bg-white/10 rounded-lg border border-white/20 p-8 text-center">
          <p className="text-charcoal mb-3">No clubs in this Bag yet.</p>
          <button
            onClick={() => navigate(`/my-bags/${setId}/add-clubs`)}
            className="btn-primary text-sm"
          >
            + Add Clubs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {setClubs.map((club) => (
            <div
              key={club._id}
              className="group bg-white/10 rounded-2xl hover:bg-white/15 transition-all duration-300 p-4 flex items-center gap-5 border border-white/20"
            >
              {/* Image */}
              <div className="w-20 h-16 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                {club.image ? (
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-charcoal text-base truncate">
                  {club.name}
                </h3>

                {/* Modern Badge */}
                <span
                  className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    club.isActive
                      ? "bg-dark-blue text-charcoal-600"
                      : "bg-yellow-50 text-red-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      club.isActive ? "bg-charcoal" : "bg-red-500"
                    }`}
                  />
                  {club.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleRemoveClub(club._id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-50 hover:bg-charcoal text-red-600 p-2 rounded-lg"
                title="Remove club"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <SaveSetModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRename}
        initialName={set.setName}
        title="Rename Set"
        existingNames={sets
          .filter((s) => s._id !== setId)
          .map((s) => s.setName)}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Set"
        message={`Are you sure you want to delete "${set.setName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default FavouriteSetDetail;
