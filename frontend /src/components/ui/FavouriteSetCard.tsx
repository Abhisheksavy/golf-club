import { Link } from "react-router-dom";
import type { FavouriteSet, Club } from "../../types";

interface FavouriteSetCardProps {
  set: FavouriteSet;
  onDelete: (setId: string) => void;
}

const FavouriteSetCard = ({ set, onDelete }: FavouriteSetCardProps) => {
  const clubs = set.clubs as Club[];
  const thumbnails = clubs.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex h-24 bg-gray-50">
        {thumbnails.length > 0 ? (
          thumbnails.map((club) => (
            <div key={club._id} className="flex-1 overflow-hidden">
              {club.image ? (
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            No clubs
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{set.setName}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
        </p>

        <div className="flex gap-2 mt-3">
          <Link
            to={`/my-sets/${set._id}`}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            View / Edit
          </Link>
          <button
            onClick={() => onDelete(set._id)}
            className="btn-danger text-sm py-1.5 px-3"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavouriteSetCard;
