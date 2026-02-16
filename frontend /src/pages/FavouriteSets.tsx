import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFavouriteSets } from "../hooks/useFavouriteSets";
import FavouriteSetCard from "../components/ui/FavouriteSetCard";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";

const FavouriteSets = () => {
  const { sets, deleteSet } = useFavouriteSets();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteTarget) {
      const name = sets.find((s) => s._id === deleteTarget)?.setName;
      deleteSet(deleteTarget);
      toast.success(`"${name}" deleted`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Favourite Sets</h1>

      {sets.length === 0 ? (
        <EmptyState
          title="No favourite sets yet"
          description="Head to the Clubs page to select clubs and save them as a set."
          action={
            <Link to="/dashboard" className="btn-primary">
              Browse Clubs
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => (
            <FavouriteSetCard
              key={set._id}
              set={set}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
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
