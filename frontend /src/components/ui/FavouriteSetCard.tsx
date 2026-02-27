import { Link } from "react-router-dom";
import type { FavouriteSet, Club } from "../../types";

interface FavouriteSetCardProps {
  set: FavouriteSet;
  onDelete: (setId: string) => void;
}

const FavouriteSetCard = ({ set, onDelete }: FavouriteSetCardProps) => {
  const clubs = set.clubs as Club[];
  const thumbnails = clubs.slice(0, 2);
  const remaining = clubs.length - thumbnails.length;

  return (
    <div className="group bg-white/10 rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image Strip */}
      <div className="relative h-36 bg-white/5 flex overflow-hidden">
        {thumbnails.length > 0 ? (
          <>
            {thumbnails.map((club, i) => (
              <div
                key={club._id}
                className="flex-1 overflow-hidden relative"
                style={{ borderRight: i < thumbnails.length - 1 ? "2px solid rgba(255,255,255,0.1)" : "none" }}
              >
                {club.image ? (
                  <img src={club.image} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {remaining > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                +{remaining} more
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-2">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-medium">Empty set</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{set.setName}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs text-white/50 font-medium">{clubs.length} {clubs.length === 1 ? "club" : "clubs"}</span>
            </div>
          </div>
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#FBE118]/20 flex items-center justify-center">
            <span className="text-sm font-bold text-golf-yellow">{clubs.length}</span>
          </div>
        </div>

        {clubs.length > 0 && (
          <div className="mb-4 space-y-1">
            {clubs.slice(0, 2).map((club) => (
              <p key={club._id} className="text-[11px] text-white/40 truncate leading-tight">• {club.name}</p>
            ))}
            {clubs.length > 2 && (
              <p className="text-[11px] text-white/40">• and {clubs.length - 2} more…</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-white/10 mt-auto">
          <Link
            to={`/my-bags/${set._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-golf-yellow bg-[#FBE118]/15 hover:bg-[#FBE118]/25 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            View / Edit
          </Link>
          <button
            onClick={() => onDelete(set._id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavouriteSetCard;
