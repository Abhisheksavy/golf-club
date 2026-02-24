import { useNavigate, useLocation } from "react-router-dom";
import { useRental } from "../../context/RentalContext";
import type { Club, Course } from "../../types";

interface ConfirmationState {
  course?: Course | null;
  date?: string | null;
  clubs?: Club[];
}

const RentalConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCourse, selectedDate, selectedClubs, reset } = useRental();

  // Router state is the source of truth (survives reset); context is the fallback
  const state = (location.state ?? {}) as ConfirmationState;
  const course = state.course ?? selectedCourse;
  const date = state.date ?? selectedDate;
  const clubs: Club[] = state.clubs ?? selectedClubs;

  const handleDashboard = () => {
    reset();
    navigate("/dashboard");
  };

  const handleNewReservation = () => {
    reset();
    navigate("/reserve/course");
  };

  // const handleViewBags = () => {
  //   reset();
  //   navigate("/my-bags");
  // };

  const handleViewReservations = () => {
    reset();
    navigate("/my-reservations");
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Reservation Confirmed!
        </h1>
        <p className="text-gray-500 text-sm">
          {course
            ? `Your clubs are reserved at ${course.name}.`
            : "Your reservation has been confirmed."}
        </p>
      </div>

      {/* Reservation details card */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 mb-8">
        {/* Course */}
        {course && (
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Course
            </p>
            <p className="font-semibold text-gray-900">{course.name}</p>
            {(course.address || course.location) && (
              <p className="text-sm text-gray-500">
                {course.address ?? course.location}
              </p>
            )}
          </div>
        )}

        {/* Date */}
        {date && (
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Date
            </p>
            <p className="font-semibold text-gray-900">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Clubs */}
        {clubs.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Reserved Clubs ({clubs.length})
            </p>
            <div className="space-y-2">
              {clubs.map((club) => (
                <div key={club._id} className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {club.image ? (
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg
                          className="w-5 h-5"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {club.name}
                    </p>
                    {club.category && (
                      <p className="text-xs text-gray-400 capitalize">
                        {club.category.replace(/-/g, " ")}
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleViewReservations}
          className="btn-primary w-full sm:w-auto"
        >
          View My Reservations
        </button>
        <button
          onClick={handleNewReservation}
          className="btn-secondary w-full sm:w-auto"
        >
          Make Another Reservation
        </button>
        <button
          onClick={handleDashboard}
          className="btn-secondary w-full sm:w-auto"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default RentalConfirmation;
