import type { Club } from "../../types";

interface ClubSelectCardProps {
  club: Club;
  isSelected: boolean;
  onToggle: (club: any) => void;
  unavailable?: boolean;
  unavailabilityReason?: string | null;
  showAvailability?: boolean;
}

const ClubSelectCard = ({
  club,
  isSelected,
  onToggle,
  unavailable = false,
  unavailabilityReason,
  showAvailability = false,
}: ClubSelectCardProps) => {
  return (
    <div
      onClick={() => !unavailable && onToggle(club)}
      className={`rounded-xl border transition-all select-none ${
        unavailable
          ? "opacity-50 cursor-not-allowed border-white/10 bg-white/5"
          : isSelected
          ? "cursor-pointer border-[#FBE118] ring-2 ring-[#FBE118]/60 bg-white/15"
          : "cursor-pointer border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15"
      }`}
    >
      {/* Image — strictly fixed height via inline style to prevent any overflow */}
      <div
        
        className="w-full bg-white/5 shrink-0 h-[150px] overflow-hidden relative rounded-t-xl"
      >
        {club.image ? (
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-inherit block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-[#FBE118]/10 flex items-start justify-end p-2">
            <div className="w-5 h-5 rounded-full bg-[#FBE118] flex items-center justify-center shadow">
              <svg
                className="w-3 h-3 text-[#285610]"
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
          </div>
        )}

        {/* Unavailable badge */}
        {showAvailability && unavailable && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full">
              {unavailabilityReason === "at-this-course"
                ? "Not at course"
                : "Not available"}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-golf-yellow leading-snug line-clamp-2">
          {club.name}
        </p>
      </div>
    </div>
  );
};

export default ClubSelectCard;
