import { Outlet, useLocation } from "react-router-dom";
import { RentalProvider } from "../../context/RentalContext";

// Major phase steps shown in the step indicator
const PHASE_STEPS = [
  { label: "Course", paths: ["/reserve/course", "/reserve/date"] },
  {
    label: "Preferences",
    paths: [
      "/reserve/auth",
      "/reserve/handedness",
      "/reserve/gender",
      "/reserve/height",
      "/reserve/preference",
      "/reserve/level",
      "/reserve/strength",
      "/reserve/bag-select",
      "/reserve/bag-review",
    ],
  },
  { label: "Clubs", paths: ["/reserve/clubs"] },
  { label: "Summary", paths: ["/reserve/summary", "/reserve/confirm"] },
];

const RentalLayout = () => {
  const location = useLocation();

  const currentPhaseIndex = PHASE_STEPS.findIndex((phase) =>
    phase.paths.some((p) => location.pathname === p)
  );

  return (
    <RentalProvider>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          {PHASE_STEPS.map((phase, i) => (
            <div key={phase.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= currentPhaseIndex
                      ? "bg-[#FBE118] text-[#285610]"
                      : "bg-white/20 text-white/50"
                  }`}
                >
                  {i < currentPhaseIndex ? (
                    <svg
                      className="w-4 h-4"
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
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-white/70 hidden sm:block">
                  {phase.label}
                </span>
              </div>
              {i < PHASE_STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1 ${
                    i < currentPhaseIndex ? "bg-[#FBE118]" : "bg-white/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Outlet />
      </div>
    </RentalProvider>
  );
};

export default RentalLayout;
