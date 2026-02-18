import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const SelectDate = () => {
  const navigate = useNavigate();
  const { selectedCourse, selectedDate, setDate } = useRental();

  if (!selectedCourse) {
    navigate("/reserve/course");
    return null;
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Select a Date</h1>
      <p className="text-gray-500 mb-6">
        Choose your rental date at <span className="font-medium text-gray-700">{selectedCourse.name}</span>.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-sm">
        <label htmlFor="rental-date" className="block text-sm font-medium text-gray-700 mb-2">
          Rental Date
        </label>
        <input
          id="rental-date"
          type="date"
          min={today}
          value={selectedDate || ""}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate("/reserve/course")} className="btn-secondary">
          Back
        </button>
        <button
          onClick={() => navigate("/reserve/clubs")}
          disabled={!selectedDate}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectDate;
