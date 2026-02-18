import { Outlet, useLocation } from "react-router-dom";
import { RentalProvider } from "../../context/RentalContext";

const steps = [
  { path: "/reserve/course", label: "Course" },
  { path: "/reserve/date", label: "Date" },
  { path: "/reserve/clubs", label: "Clubs" },
  { path: "/reserve/summary", label: "Summary" },
  { path: "/reserve/confirm", label: "Done" },
];

const RentalLayout = () => {
  const location = useLocation();
  const currentIndex = steps.findIndex((s) => s.path === location.pathname);

  return (
    <RentalProvider>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, i) => (
            <div key={step.path} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= currentIndex
                      ? "bg-golf-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < currentIndex ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-500 hidden sm:block">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1 ${
                    i < currentIndex ? "bg-golf-600" : "bg-gray-200"
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
