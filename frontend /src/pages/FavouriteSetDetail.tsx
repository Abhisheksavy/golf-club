import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { mockClubs } from "../data/mockClubs";
import { useFavouriteSets } from "../hooks/useFavouriteSets";
import ClubCard from "../components/ui/ClubCard";
import SaveSetModal from "../components/ui/SaveSetModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import type { Club } from "../types";

const FavouriteSetDetail = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { getSet, renameSet, updateSetClubs, deleteSet } = useFavouriteSets();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddClubsModal, setShowAddClubsModal] = useState(false);

  const set = getSet(setId || "");

  if (!set) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Set not found
        </h2>
        <p className="text-gray-500 mb-4">
          This favourite set doesn't exist or was deleted.
        </p>
        <button onClick={() => navigate("/my-sets")} className="btn-primary">
          Back to My Sets
        </button>
      </div>
    );
  }

  const setClubs = set.clubs as Club[];
  const setClubIds = new Set(setClubs.map((c) => c._id));
  const availableClubs = mockClubs.filter((c) => !setClubIds.has(c._id));

  const handleRemoveClub = (clubId: string) => {
    const updated = setClubs.filter((c) => c._id !== clubId);
    updateSetClubs(set._id, updated);
    toast.success("Club removed");
  };

  const handleAddClub = (club: Club) => {
    updateSetClubs(set._id, [...setClubs, club]);
    toast.success(`${club.name} added`);
  };

  const handleRename = (newName: string) => {
    renameSet(set._id, newName);
    toast.success(`Renamed to "${newName}"`);
  };

  const handleDelete = () => {
    deleteSet(set._id);
    toast.success(`"${set.setName}" deleted`);
    navigate("/my-sets");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/my-sets")}
        className="text-sm text-golf-600 hover:text-golf-700 mb-4 inline-flex items-center gap-1"
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
        Back to My Sets
      </button>

      {/* Set info card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{set.setName}</h1>
            <p className="text-sm text-gray-500 mt-1">
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
        <h2 className="text-lg font-semibold text-gray-900">
          Clubs in this Set
        </h2>
        <button
          onClick={() => setShowAddClubsModal(true)}
          className="btn-primary text-sm"
        >
          + Add Clubs
        </button>
      </div>

      {setClubs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-3">No clubs in this set yet.</p>
          <button
            onClick={() => setShowAddClubsModal(true)}
            className="btn-primary text-sm"
          >
            + Add Clubs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {setClubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4"
            >
              <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                {club.image ? (
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {club.name}
                </h3>
                {club.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {club.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveClub(club._id)}
                className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                title="Remove club"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Clubs Modal */}
      <Modal
        isOpen={showAddClubsModal}
        onClose={() => setShowAddClubsModal(false)}
        title="Add Clubs"
      >
        {availableClubs.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">
            All clubs are already in this set.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto -mx-6 px-6">
            <div className="grid grid-cols-2 gap-3">
              {availableClubs.map((club) => (
                <ClubCard
                  key={club._id}
                  club={club}
                  isSelected={false}
                  onToggle={() => handleAddClub(club)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowAddClubsModal(false)}
            className="btn-secondary text-sm"
          >
            Done
          </button>
        </div>
      </Modal>

      <SaveSetModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRename}
        initialName={set.setName}
        title="Rename Set"
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
