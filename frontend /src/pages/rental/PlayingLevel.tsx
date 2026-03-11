import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const LEVELS = [
  {
    key: "beginner" as const,
    label: "Beginner",
    description: "Filters to Cavity Backs",
  },
  {
    key: "intermediate" as const,
    label: "Intermediate",
    description: "Filters to Muscle Backs",
  },
  {
    key: "expert" as const,
    label: "Expert",
    description: "Filters to Blades",
  },
];

const STRENGTHS = [
  {
    key: "gentle" as const,
    label: "Gentle",
    description: "Filters to Flexible Shafts",
  },
  {
    key: "strong" as const,
    label: "Strong",
    description: "Filters to Stiff Shafts",
  },
];

const PlayingLevel = () => {
  const navigate = useNavigate();
  const { playingLevel, setPlayingLevel, swingStrength, setSwingStrength } = useRental();

  const canContinue = !!(playingLevel && swingStrength);

  const handleContinue = () => {
    if (canContinue) navigate("/reserve/clubs");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-golf-yellow mb-1 text-center">Tell Us More About Your Game</h1>
      <p className="text-golf-yellow text-sm mb-8 text-center">This helps us recommend the right clubs.</p>

      {/* Playing level */}
      <div className="mb-8">
        <p className="text-sm font-medium text-golf-yellow mb-3">What's your playing level?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LEVELS.map(({ key, label, description }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPlayingLevel(key)}
              className={`px-4 py-4 rounded-xl border-2 text-left transition-all ${
                playingLevel === key
                  ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/20"
                  : "border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15"
              }`}
            >
              <p className={`font-semibold text-sm ${playingLevel === key ? "text-golf-yellow" : "text-golf-yellow"}`}>
                {label}
              </p>
              <p className="text-xs text-golf-yellow mt-1">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Swing strength */}
      <div className="mb-8">
        <p className="text-sm font-medium text-golf-yellow mb-3">How would you describe your swing strength?</p>
        <div className="grid grid-cols-2 gap-3">
          {STRENGTHS.map(({ key, label, description }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSwingStrength(key)}
              className={`px-4 py-4 rounded-xl border-2 text-left transition-all ${
                swingStrength === key
                  ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/20"
                  : "border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15"
              }`}
            >
              <p className={`font-semibold text-sm ${swingStrength === key ? "text-golf-yellow" : "text-golf-yellow"}`}>
                {label}
              </p>
              <p className="text-xs text-golf-yellow mt-1">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Club Selection
        </button>
      </div>
    </div>
  );
};

export default PlayingLevel;
