import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRental } from "../../context/RentalContext";
import { createReservation } from "../../api/reservations";

const RentalSummary = () => {
  const navigate = useNavigate();
  const { selectedCourse, selectedDate, selectedClubs, saveToBag } = useRental();

  if (!selectedCourse || !selectedDate || selectedClubs.length === 0) {
    navigate("/reserve/course");
    return null;
  }

  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      navigate("/reserve/confirm");
    },
    onError: () => {
      toast.error("Failed to create reservation. Please try again.");
    },
  });

  const handleConfirm = () => {
    mutation.mutate({
      course: selectedCourse.name,
      date: selectedDate,
      clubs: selectedClubs.map((c) => c._id),
      saveToBag,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Your Reservation</h1>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {/* Course */}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Course</p>
          <p className="font-semibold text-gray-900">{selectedCourse.name}</p>
          <p className="text-sm text-gray-500">{selectedCourse.location}</p>
        </div>

        {/* Date */}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
          <p className="font-semibold text-gray-900">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Clubs */}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            Clubs ({selectedClubs.length})
          </p>
          <div className="space-y-2">
            {selectedClubs.map((club) => (
              <div key={club._id} className="flex items-center gap-3">
                <div className="w-10 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  {club.image && (
                    <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-sm text-gray-900">{club.name}</span>
              </div>
            ))}
          </div>
        </div>

        {saveToBag && (
          <div className="p-4">
            <p className="text-sm text-golf-600">
              This selection will also be saved as a favourite bag.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate("/reserve/clubs")} className="btn-secondary">
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={mutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {mutation.isPending ? "Confirming..." : "Confirm Reservation"}
        </button>
      </div>
    </div>
  );
};

export default RentalSummary;
