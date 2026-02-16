import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { mockClubs } from "../data/mockClubs";
import { useClubSelection } from "../hooks/useClubSelection";
import { useFavouriteSets } from "../hooks/useFavouriteSets";
import ClubCard from "../components/ui/ClubCard";
import SelectionBar from "../components/ui/SelectionBar";
import SaveSetModal from "../components/ui/SaveSetModal";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { selectedCount, selectedClubs, toggle, clear, isSelected } =
    useClubSelection();
  const { createSet } = useFavouriteSets();

  const filteredClubs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return mockClubs;
    return mockClubs.filter(
      (club) =>
        club.name.toLowerCase().includes(q) ||
        club.description?.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSaveSet = (name: string) => {
    createSet(name, selectedClubs);
    clear();
    toast.success(`"${name}" saved with ${selectedClubs.length} clubs!`);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Clubs</h1>
          <input
            type="text"
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field sm:max-w-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              isSelected={isSelected(club._id)}
              onToggle={toggle}
            />
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            No clubs match "{search}"
          </p>
        )}
      </div>

      <SelectionBar
        count={selectedCount}
        onSave={() => setShowSaveModal(true)}
        onClear={clear}
      />

      <SaveSetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSet}
      />

      {selectedCount > 0 && <div className="h-16" />}
    </>
  );
};

export default Dashboard;
