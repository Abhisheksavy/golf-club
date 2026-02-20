import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const LEVELS = [
  {
    key: "beginner" as const,
    label: "Beginner",
    description: "New to the game or still learning the basics",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    key: "intermediate" as const,
    label: "Intermediate",
    description: "Play regularly and have a decent handicap",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    key: "expert" as const,
    label: "Expert",
    description: "Competitive player with a low handicap",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

const PlayingLevel = () => {
  const navigate = useNavigate();
  const { playingLevel, setPlayingLevel } = useRental();

  const handleSelect = (level: "beginner" | "intermediate" | "expert") => {
    setPlayingLevel(level);
    navigate("/reserve/strength");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">What is your playing level?</h1>
      <p className="text-gray-500 mb-8">We'll match you with clubs suited to your skill level.</p>

      <div className="grid gap-4">
        {LEVELS.map(({ key, label, description, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect(key)}
            className={`flex items-center gap-6 p-6 rounded-xl border-2 transition-all min-h-[90px] text-left ${
              playingLevel === key
                ? "border-golf-500 bg-golf-50 ring-2 ring-golf-200"
                : "border-gray-200 bg-white hover:border-golf-400 hover:bg-golf-50"
            }`}
          >
            <span className="text-golf-600 flex-shrink-0">{icon}</span>
            <div>
              <p className="text-lg font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-start mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
      </div>
    </div>
  );
};

export default PlayingLevel;
