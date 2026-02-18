import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getAvailableClubs } from "../../api/clubs";
import { getFavourites } from "../../api/favourites";
import type { Club, AvailableClub } from "../../types";

const SelectClubs = () => {
  const navigate = useNavigate();
  const { selectedCourse, selectedDate, selectedClubs, setClubs, saveToBag, setSaveToBag } = useRental();
  const [loadBagMode, setLoadBagMode] = useState(false);

  if (!selectedCourse || !selectedDate) {
    navigate("/reserve/course");
    return null;
  }

  const { data: availableClubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["availableClubs", selectedCourse.name, selectedDate],
    queryFn: () => getAvailableClubs(selectedCourse.name, selectedDate),
  });

  const { data: bags = [] } = useQuery({
    queryKey: ["favourites"],
    queryFn: getFavourites,
  });

  const selectedIds = new Set(selectedClubs.map((c) => c._id));

  const toggleClub = (club: AvailableClub) => {
    if (!club.available) return;
    if (selectedIds.has(club._id)) {
      setClubs(selectedClubs.filter((c) => c._id !== club._id));
    } else {
      setClubs([...selectedClubs, club]);
    }
  };

  const loadBag = (bagClubs: Club[]) => {
    // Only load clubs that are available
    const availableIds = new Set(
      availableClubs.filter((c) => c.available).map((c) => c._id)
    );
    const validClubs = bagClubs.filter((c) => availableIds.has(c._id));
    setClubs(validClubs);
    setLoadBagMode(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Clubs</h1>
      <p className="text-gray-500 mb-4">
        Choose clubs for your round at {selectedCourse.name} on{" "}
        {new Date(selectedDate).toLocaleDateString()}.
      </p>

      {/* Load from bag option */}
      {bags.length > 0 && (
        <div className="mb-6">
          {!loadBagMode ? (
            <button
              onClick={() => setLoadBagMode(true)}
              className="text-sm text-golf-600 hover:text-golf-700 font-medium"
            >
              Load from a saved bag
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select a bag to load:</h3>
              <div className="space-y-2">
                {bags.map((bag) => (
                  <button
                    key={bag._id}
                    onClick={() => loadBag(bag.clubs as Club[])}
                    className="w-full text-left p-3 rounded border border-gray-200 hover:border-golf-300 hover:bg-golf-50 transition-colors"
                  >
                    <span className="font-medium text-sm">{bag.setName}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(bag.clubs as Club[]).length} clubs)
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLoadBagMode(false)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {clubsLoading ? (
        <div className="text-center py-12 text-gray-500">Loading available clubs...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableClubs.map((club) => (
            <button
              key={club._id}
              type="button"
              onClick={() => toggleClub(club)}
              disabled={!club.available}
              className={`relative bg-white rounded-lg shadow-sm border-2 overflow-hidden text-left transition-all ${
                !club.available
                  ? "border-gray-100 opacity-50 cursor-not-allowed"
                  : selectedIds.has(club._id)
                  ? "border-golf-500 ring-2 ring-golf-200"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Availability badge */}
              <div
                className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-xs font-medium ${
                  club.available
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {club.available ? "Available" : "Unavailable"}
              </div>

              {/* Selected check */}
              {selectedIds.has(club._id) && (
                <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-golf-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {club.image ? (
                  <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{club.name}</h3>
                {club.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{club.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Save as bag toggle */}
      <label className="flex items-center gap-2 mt-6 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={saveToBag}
          onChange={(e) => setSaveToBag(e.target.checked)}
          className="rounded border-gray-300 text-golf-600 focus:ring-golf-500"
        />
        Save this selection as a favourite bag
      </label>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate("/reserve/date")} className="btn-secondary">
          Back
        </button>
        <button
          onClick={() => navigate("/reserve/summary")}
          disabled={selectedClubs.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next ({selectedClubs.length} selected)
        </button>
      </div>
    </div>
  );
};

export default SelectClubs;
