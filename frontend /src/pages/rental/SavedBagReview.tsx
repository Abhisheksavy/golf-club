import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getAvailableClubs } from "../../api/clubs";

const SavedBagReview = () => {
  const navigate = useNavigate();
  const { selectedCourse, selectedDate, selectedClubs } = useRental();

  // Course-only: always run if course selected (tells us if club is in course inventory)
  const { data: courseClubs = [] } = useQuery({
    queryKey: ["courseClubs", selectedCourse?.name],
    queryFn: () => getAvailableClubs(selectedCourse!.name),
    enabled: !!selectedCourse,
  });

  // Date-specific: run if course + date selected
  const { data: dateClubs = [] } = useQuery({
    queryKey: ["availableClubs", selectedCourse?.name, selectedDate],
    queryFn: () => getAvailableClubs(selectedCourse!.name, selectedDate!),
    enabled: !!(selectedCourse && selectedDate),
  });

  const courseMap = new Map(courseClubs.map((c) => [c._id, c.unavailabilityReason]));
  const dateMap = new Map(dateClubs.map((c) => [c._id, c.unavailabilityReason]));

  // Per-club availability label
  const getClubStatus = (clubId: string): { available: boolean; label: string } => {
    if (courseMap.get(clubId) === "at-this-course") {
      return { available: false, label: "Unavailable at this course" };
    }
    if (selectedDate && dateMap.get(clubId) === "on-this-date") {
      return { available: false, label: "Unavailable on this date" };
    }
    return { available: true, label: "" };
  };

  const hasAvailabilityData = !!selectedCourse && courseClubs.length > 0;

  const anyAtCourse = hasAvailabilityData &&
    selectedClubs.some((c) => courseMap.get(c._id) === "at-this-course");
  const anyOnDate = !!(selectedDate && dateClubs.length > 0) &&
    selectedClubs.some((c) => dateMap.get(c._id) === "on-this-date");

  let bannerMessage: string | null = null;
  if (anyAtCourse && anyOnDate) {
    bannerMessage = "Some clubs are unavailable — see details below.";
  } else if (anyAtCourse) {
    bannerMessage = `Some clubs in this bag are not available at ${selectedCourse!.name}.`;
  } else if (anyOnDate) {
    bannerMessage = "Some clubs in this bag are unavailable on the selected date.";
  }

  if (selectedClubs.length === 0) {
    navigate("/reserve/bag-select", { replace: true });
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-2">Review Saved Bag</h1>
      <p className="text-white/60 mb-4">
        Here are the clubs from your saved bag.
        {selectedCourse && selectedDate
          ? ` Availability shown for ${selectedCourse.name} on ${new Date(selectedDate).toLocaleDateString()}.`
          : selectedCourse
          ? ` Availability shown for ${selectedCourse.name}.`
          : ""}
      </p>

      {bannerMessage && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-amber-700">{bannerMessage}</p>
        </div>
      )}

      <div className="bg-white/10 rounded-lg border border-white/20 divide-y divide-white/10 mb-6">
        {selectedClubs.map((club) => {
          const status = hasAvailabilityData ? getClubStatus(club._id) : { available: true, label: "" };
          return (
            <div
              key={club._id}
              className={`flex items-center gap-4 p-4 ${!status.available ? "opacity-60" : ""}`}
            >
              <div className="w-12 h-10 rounded bg-white/10 overflow-hidden flex-shrink-0">
                {club.image ? (
                  <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{club.name}</p>
                {club.category && (
                  <p className="text-xs text-white/40 capitalize">{club.category.replace(/-/g, " ")}</p>
                )}
              </div>
              {!status.available && (
                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
                  {status.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button onClick={() => navigate("/reserve/clubs")} className="btn-secondary">
          Change Selections
        </button>
        <button onClick={() => navigate("/reserve/summary")} className="btn-primary">
          Continue
        </button>
      </div>
    </div>
  );
};

export default SavedBagReview;
