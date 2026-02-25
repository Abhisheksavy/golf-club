import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getFavourites } from "../../api/favourites";
import { isAuthenticated } from "../../hooks/useAuth";
import type { Club } from "../../types";

const SavedBagSelect = () => {
  const navigate = useNavigate();
  const { setClubs } = useRental();

  const authed = isAuthenticated();

  const { data, isLoading: bagsLoading } = useQuery({
    queryKey: ["favourites", "all"],
    queryFn: () => getFavourites(1, 100),
    enabled: authed,
  });
  const bags = data?.favourites ?? [];

  if (!authed) {
    navigate("/reserve/auth", { replace: true });
    return null;
  }

  // getFavourites already enriches clubs from Booqable — bag.clubs is Club[]
  const handleUseBag = (bagClubs: (Club | string)[]) => {
    const clubs = bagClubs.filter((c): c is Club => typeof c === "object");
    setClubs(clubs);
    navigate("/reserve/bag-review");
  };

  const handleNewClubs = () => {
    navigate("/reserve/preference");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
      <p className="text-gray-500 mb-8">
        Use a saved bag or start fresh with new club selections.
      </p>

      {bagsLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading your bags...
        </div>
      ) : bags.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          <p className="text-gray-500 text-sm">No saved bags yet.</p>
        </div>
      ) : (
        <div className="relative mb-6">
          <div className="max-h-72 overflow-y-auto pr-1 grid gap-3">
            {bags.map((bag) => {
              return (
                <button
                  key={bag._id}
                  type="button"
                  onClick={() => handleUseBag(bag.clubs as (Club | string)[])}
                  className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-golf-400 hover:bg-golf-50 transition-all text-left"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{bag.setName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {Array.isArray(bag.clubs) ? bag.clubs.length : 0} club
                      {bag.clubs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
          {bags.length > 3 && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleNewClubs}
        className="w-full flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-golf-400 hover:bg-golf-50 transition-all"
      >
        <svg
          className="w-6 h-6 text-golf-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <span className="font-medium text-gray-700">Choose new clubs</span>
      </button>
    </div>
  );
};

export default SavedBagSelect;
