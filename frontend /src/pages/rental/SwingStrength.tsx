import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const SwingStrength = () => {
  const navigate = useNavigate();
  const { swingStrength, setSwingStrength } = useRental();

  const handleSelect = (s: "gentle" | "strong") => {
    setSwingStrength(s);
    navigate("/reserve/clubs");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-2">How would you describe your swing?</h1>
      <p className="text-white/60 mb-8">This helps us recommend the right shaft flexibility.</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSelect("gentle")}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all min-h-[160px] ${
            swingStrength === "gentle"
              ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/30"
              : "border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15"
          }`}
        >
          <svg className="w-12 h-12 text-golf-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          <div className="text-center">
            <p className="text-xl font-semibold text-white">Gentle</p>
            <p className="text-xs text-white/50 mt-1">Smooth, controlled swing<br/>→ Flexible shaft</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("strong")}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all min-h-[160px] ${
            swingStrength === "strong"
              ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/30"
              : "border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15"
          }`}
        >
          <svg className="w-12 h-12 text-golf-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <div className="text-center">
            <p className="text-xl font-semibold text-white">Strong</p>
            <p className="text-xs text-white/50 mt-1">Fast, powerful swing<br/>→ Stiff shaft</p>
          </div>
        </button>
      </div>

      <div className="flex justify-start mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
      </div>
    </div>
  );
};

export default SwingStrength;
