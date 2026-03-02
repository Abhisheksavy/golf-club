import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRental } from "../../context/RentalContext";
import { createReservation } from "../../api/reservations";
import { createFavourite } from "../../api/favourites";
import { isAuthenticated } from "../../hooks/useAuth";

const HANDEDNESS_LABEL = { right: "Right-Handed", left: "Left-Handed" };
const GENDER_LABEL = { male: "Male", female: "Female" };
const LEVEL_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};
const STRENGTH_LABEL = { gentle: "Gentle Swing", strong: "Strong Swing" };

const RentalSummary = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    selectedCourse,
    selectedDate,
    selectedClubs,
    saveToBag,
    isGuest,
    handedness,
    gender,
    height,
    playingLevel,
    swingStrength,
  } = useRental();

  if (selectedClubs.length === 0) {
    navigate("/reserve/clubs", { replace: true });
    return null;
  }

  const canCheckout = !!(selectedCourse && selectedDate);
  const loggedIn = isAuthenticated();

  const reservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      navigate("/reserve/confirm", {
        state: {
          course: selectedCourse,
          date: selectedDate,
          clubs: selectedClubs,
        },
      });
    },
    onError: () => {
      toast.error("Failed to create reservation. Please try again.");
    },
  });

  const saveBagMutation = useMutation({
    mutationFn: ({ name, clubs }: { name: string; clubs: string[] }) =>
      createFavourite(name, clubs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
      toast.success("Bag saved to your Locker Room!");
      navigate("/my-bags");
    },
    onError: () => {
      toast.error("Failed to save bag. Please try again.");
    },
  });

  const handleSaveBag = () => {
    if (!loggedIn) {
      sessionStorage.setItem("returnTo", "/reserve/summary");
      navigate("/login");
      return;
    }
    const now = new Date();
    const bagName = `My Bag — ${now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    saveBagMutation.mutate({
      name: bagName,
      clubs: selectedClubs.map((c) => c._id),
    });
  };

  const handlePlayRound = () => {
    if (!canCheckout) return;
    if (!loggedIn) {
      sessionStorage.setItem("returnTo", "/reserve/summary");
      navigate("/login");
      return;
    }
    reservationMutation.mutate({
      course: selectedCourse!.name,
      date: selectedDate!,
      clubs: selectedClubs.map((c) => c._id),
      saveToBag,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-6">
        Review Your Selection
      </h1>

      <div className="bg-white/10 rounded-lg border border-white/20 divide-y divide-white/10">
        {/* Guest preferences */}
        {isGuest &&
          (handedness || gender || height || playingLevel || swingStrength) && (
            <div className="p-4">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-2">
                Your Preferences
              </p>
              <div className="flex flex-wrap gap-2">
                {handedness && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70">
                    {HANDEDNESS_LABEL[handedness]}
                  </span>
                )}
                {gender && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70">
                    {GENDER_LABEL[gender]}
                  </span>
                )}
                {height && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70">
                    {height}
                  </span>
                )}
                {playingLevel && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBE118]/20 text-golf-yellow">
                    {LEVEL_LABEL[playingLevel]}
                  </span>
                )}
                {swingStrength && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBE118]/20 text-golf-yellow">
                    {STRENGTH_LABEL[swingStrength]}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Course */}
        {selectedCourse && (
          <div className="p-4">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
              Course
            </p>
            <p className="font-semibold text-white">{selectedCourse.name}</p>
            {(selectedCourse.address || selectedCourse.location) && (
              <p className="text-sm text-white/60">
                {selectedCourse.address ?? selectedCourse.location}
              </p>
            )}
          </div>
        )}

        {/* Date */}
        {selectedDate && (
          <div className="p-4">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
              Date
            </p>
            <p className="font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Clubs */}
        <div className="p-4">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-3">
            Clubs ({selectedClubs.length})
          </p>
          <div className="space-y-2">
            {selectedClubs.map((club) => (
              <div key={club._id} className="flex items-center gap-3">
                <div className="w-20 h-16 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                  {club.image && (
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">{club.name}</span>
                  {club.category && (
                    <span className="ml-2 text-xs text-white/40 capitalize">
                      {club.category.replace(/-/g, " ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {saveToBag && (
          <div className="p-4">
            <p className="text-sm text-golf-yellow">
              This selection will also be saved as a favourite bag.
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8">
        <button
          onClick={() => navigate("/reserve/clubs")}
          className="btn-secondary"
        >
          Back
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Save to Locker Room (logged-in) or Save to Session (guest) — always available */}
          <button
            onClick={handleSaveBag}
            disabled={saveBagMutation.isPending}
            className="btn-secondary disabled:opacity-50"
          >
            {saveBagMutation.isPending ? "Saving..." : "Save to Locker Room"}
          </button>

          {/* Play a Round — only if course + date selected */}
          {canCheckout && (
            <button
              onClick={handlePlayRound}
              disabled={reservationMutation.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {reservationMutation.isPending ? "Confirming..." : "Play a Round"}
            </button>
          )}
        </div>
      </div>

      {!loggedIn && (
        <p className="text-xs text-white/40 text-right mt-3">
          <button
            onClick={() => navigate("/login")}
            className="text-golf-yellow hover:underline"
          >
            Log in
          </button>{" "}
          to save permanently to your Locker Room.
        </p>
      )}
    </div>
  );
};

export default RentalSummary;
