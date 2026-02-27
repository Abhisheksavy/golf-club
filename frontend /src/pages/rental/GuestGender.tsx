import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const GuestGender = () => {
  const navigate = useNavigate();
  const { gender, setGender } = useRental();

  const handleSelect = (g: "male" | "female") => {
    setGender(g);
    navigate("/reserve/height");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-2">
        What is your gender?
      </h1>
      <p className="text-white/60 mb-8">
        Used to recommend the right club specifications.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSelect("male")}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all min-h-[140px] ${
            gender === "male"
              ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/30"
              : "border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15"
          }`}
        >
          <svg
            className="w-12 h-12 text-golf-yellow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <p className="text-xl font-semibold text-white">Male</p>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("female")}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all min-h-[140px] ${
            gender === "female"
              ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/30"
              : "border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15"
          }`}
        >
          <svg
            className="w-12 h-12 text-golf-yellow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <p className="text-xl font-semibold text-white">Female</p>
        </button>
      </div>

      <div className="flex justify-start mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
      </div>
    </div>
  );
};

export default GuestGender;
