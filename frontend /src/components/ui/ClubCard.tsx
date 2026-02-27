import type { Club } from "../../types";

interface ClubMetadata {
  product_type?: string;
  tracking_type?: string;
  price_period?: string;
  base_price_in_cents?: number;
  deposit_in_cents?: number;
  archived?: boolean;
  description?: string;
  [key: string]: unknown;
}

interface ClubCardProps {
  club: Club;
  isSelected: boolean;
  onToggle: (club: Club) => void;
  view?: "grid" | "table";
}

const formatPrice = (cents?: number) => {
  if (!cents) return null;
  return `$${(cents / 100).toFixed(2)}`;
};

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${color}`}
  >
    {label}
  </span>
);

const ClubCard = ({
  club,
  isSelected,
  onToggle,
  view = "grid",
}: ClubCardProps) => {
  const meta = club.metadata as ClubMetadata | undefined;
  const price = formatPrice(meta?.base_price_in_cents);
  const isActive = club.isActive;
  const isArchived = meta?.archived;
  const productType = meta?.product_type;
  const trackingType = meta?.tracking_type;
  const pricePeriod = meta?.price_period;
  const deposit = formatPrice(meta?.deposit_in_cents);

  /* ─── TABLE ROW ─── */
  if (view === "table") {
    return (
      <tr
        onClick={() => onToggle(club)}
        className={`group cursor-pointer border-b border-slate-100 transition-colors ${
          isSelected ? "bg-[#FBE118]/10" : "hover:bg-white/5"
        }`}
      >
        {/* Checkbox col */}
        <td className="w-10 pl-4 pr-2 py-3">
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-golf-dark border-white"
                : "border-slate-300 group-hover:border-white"
            }`}
          >
            {isSelected && (
              <svg
                className="w-2.5 h-2.5 text-white"
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
            )}
          </div>
        </td>

        {/* Image */}
        <td className="py-3 pr-4 w-16">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
            {club.image ? (
              <img
                src={club.image}
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
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
        </td>

        {/* Name + SKU */}
        <td className="py-3 pr-4 min-w-0">
          <p className="text-sm font-semibold text-golf-yellow line-clamp-1">
            {club.name}
          </p>
          <p className="text-[11px] text-golf-yellow font-mono mt-0.5 truncate">
            {club.sku}
          </p>
        </td>

        {/* Type */}
        <td className="py-3 pr-4 hidden sm:table-cell">
          {typeof productType === "string" && (
            <Badge
              label={productType}
              color={
                productType === "rental"
                  ? "bg-sky-100 text-sky-700"
                  : "bg-violet-100 text-violet-700"
              }
            />
          )}
        </td>

        {/* Tracking */}
        <td className="py-3 pr-4 hidden md:table-cell">
          {typeof trackingType === "string" && (
            <span className="text-xs text-golf-yellow capitalize">
              {trackingType || "-"}
            </span>
          )}
        </td>

        {/* Price */}
        <td className="py-3 pr-4 text-right hidden sm:table-cell">
          {price && (
            <div>
              <span className="text-sm font-bold text-golf-yellow">
                {price || 0}
              </span>
              {typeof pricePeriod === "string" && (
                <span className="text-[10px] text-golf-yellow ml-1">
                  /{pricePeriod}
                </span>
              )}
            </div>
          )}
        </td>

        {/* Status */}
        <td className="py-3 pr-4 text-center hidden lg:table-cell">
          <div className="flex items-center gap-1.5 justify-center">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-green-400" : "bg-white/20"
              }`}
            />
            <span
              className={`text-xs ${
                isActive ? "text-green-400" : "text-white/40"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </td>

        {/* Archived */}
        <td className="py-3 pr-4 text-center hidden lg:table-cell">
          {isArchived ? (
            <Badge label="Archived" color="bg-amber-100 text-amber-700" />
          ) : (
            <span className="text-xs text-white/30">—</span>
          )}
        </td>
      </tr>
    );
  }

  /* ─── GRID CARD ─── */
  return (
    <button
      type="button"
      onClick={() => onToggle(club)}
      className={`relative bg-white/10 rounded-2xl overflow-hidden text-left transition-all duration-200 group border border-white/20 ${
        isSelected
          ? "ring-2 ring-[#FBE118] shadow-lg shadow-black/20"
          : "ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/5"
      }`}
    >
      {/* Selection check */}
      <div
        className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
          isSelected
            ? "bg-[#FBE118] border-[#FBE118] shadow-md"
            : "bg-white/20 border-white/30 group-hover:border-[#FBE118] backdrop-blur-sm"
        }`}
      >
        {isSelected && (
          <svg
            className="w-3.5 h-3.5 text-white"
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
        )}
      </div>

      {/* Status dot */}
      <div className="absolute top-3 left-3 z-10">
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-green-400" : "bg-white/20"
          } shadow`}
          title={isActive ? "Active" : "Inactive"}
        />
      </div>

      {/* Image */}
      <div className="aspect-[4/3] bg-white/5 overflow-hidden">
        {club.image ? (
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-inherit group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg
              className="w-14 h-14"
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
      </div>

      {/* Content */}
      <div className="p-4 bg-transparent">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {typeof productType === "string" && (
            <Badge
              label={productType}
              color={
                productType === "rental"
                  ? "bg-sky-100 text-sky-700"
                  : "bg-violet-100 text-violet-700"
              }
            />
          )}
          {typeof trackingType === "string" && (
            <Badge label={trackingType} color="bg-white/10 text-white/50" />
          )}
          {isArchived && (
            <Badge label="Archived" color="bg-amber-100 text-amber-700" />
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug mb-1">
          {club.name}
        </h3>

        {/* SKU */}
        <p className="text-[10px] font-mono text-white/40 truncate mb-3">
          {club.sku}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          {price ? (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-white">{price}</span>
              {typeof pricePeriod === "string" && (
                <span className="text-[11px] text-white/40">
                  /{pricePeriod}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-white/40">No price set</span>
          )}

          {deposit && deposit !== "$0.00" && (
            <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
              dep. {deposit}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ClubCard;
