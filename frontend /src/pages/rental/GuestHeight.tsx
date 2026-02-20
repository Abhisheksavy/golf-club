import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const MALE_HEIGHTS = [
  "5'4\" and under",
  "5'4\" to 5'7\"",
  "5'7\" to 6'0\"",
  "6'0\" to 6'4\"",
  "6'4\" and up",
];

const FEMALE_HEIGHTS = [
  "5'0\" and under",
  "5'0\" to 5'3\"",
  "5'3\" to 5'7\"",
  "5'7\" to 6'0\"",
  "6'0\" and up",
];

const GuestHeight = () => {
  const navigate = useNavigate();
  const { gender, height, setHeight } = useRental();

  const heights = gender === "female" ? FEMALE_HEIGHTS : MALE_HEIGHTS;

  const handleNext = () => {
    if (height) navigate("/reserve/preference");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        What is your height?
      </h1>
      <p className="text-gray-500 mb-8">
        Club length is fitted to your height for best performance.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-sm">
        <label
          htmlFor="height-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select your height
        </label>
        <select
          id="height-select"
          value={height || ""}
          onChange={(e) => setHeight(e.target.value)}
          className="input-field"
        >
          <option value="" disabled>
            Choose height...
          </option>
          {heights.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!height}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GuestHeight;
