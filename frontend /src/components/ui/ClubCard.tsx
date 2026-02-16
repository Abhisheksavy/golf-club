import type { Club } from "../../types";

interface ClubCardProps {
  club: Club;
  isSelected: boolean;
  onToggle: (club: Club) => void;
}

const ClubCard = ({ club, isSelected, onToggle }: ClubCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(club)}
      className={`relative bg-white rounded-lg shadow-sm border-2 overflow-hidden text-left transition-all hover:shadow-md ${
        isSelected
          ? "border-golf-500 ring-2 ring-golf-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-golf-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {club.image ? (
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
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

      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
          {club.name}
        </h3>
        {club.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {club.description}
          </p>
        )}
      </div>
    </button>
  );
};

export default ClubCard;
