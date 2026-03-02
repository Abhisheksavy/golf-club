import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const LEVELS = [
  {
    key: "beginner" as const,
    label: "Beginner",
    // description: "New to the game or still learning the basics",
  },
  {
    key: "intermediate" as const,
    label: "Intermediate",
    // description: "Play regularly and have a decent handicap",
  },
  {
    key: "expert" as const,
    label: "Expert",
    // description: "Competitive player with a low handicap",
  },
];

const STRENGTHS = [
  {
    key: "gentle" as const,
    label: "Gentle",
    // description: "Smooth, controlled swing — Flexible shaft",
  },
  {
    key: "strong" as const,
    label: "Strong",
    // description: "Fast, powerful swing — Stiff shaft",
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
      <p className="text-white/60 text-sm mb-8 text-center">This helps us recommend the right clubs.</p>

      {/* Playing level */}
      <div className="mb-8">
        <p className="text-sm font-medium text-white/80 mb-3">What's your playing level?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LEVELS.map(({ key, label }) => (
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
              <p className={`font-semibold text-sm ${playingLevel === key ? "text-golf-yellow" : "text-white"}`}>
                {label}
              </p>
              {/* <p className="text-xs text-white/50 mt-0.5">{description}</p> */}
            </button>
          ))}
        </div>
      </div>

      {/* Swing strength */}
      <div className="mb-8">
        <p className="text-sm font-medium text-white/80 mb-3">How would you describe your swing strength?</p>
        <div className="grid grid-cols-2 gap-3">
          {STRENGTHS.map(({ key, label }) => (
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
              <p className={`font-semibold text-sm ${swingStrength === key ? "text-golf-yellow" : "text-white"}`}>
                {label}
              </p>
              {/* <p className="text-xs text-white/50 mt-0.5">{description}</p> */}
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
