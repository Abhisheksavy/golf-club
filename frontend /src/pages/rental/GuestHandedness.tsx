import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const GuestHandedness = () => {
  const navigate = useNavigate();
  const { handedness, setHandedness } = useRental();

  const handleSelect = (h: "right" | "left") => {
    setHandedness(h);
    navigate("/reserve/gender");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Which hand do you play with?</h1>
      <p className="text-gray-500 mb-8">This helps us find the right clubs for you.</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSelect("right")}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all min-h-[140px] ${
            handedness === "right"
              ? "border-golf-500 bg-golf-50 ring-2 ring-golf-200"
              : "border-gray-200 bg-white hover:border-golf-400 hover:bg-golf-50"
          }`}
        >
          <svg className="w-12 h-12 text-golf-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m-10.562-1.5h-.018" />
          </svg>
          <p className="text-xl font-semibold text-gray-900">Right-Handed</p>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("left")}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all min-h-[140px] ${
            handedness === "left"
              ? "border-golf-500 bg-golf-50 ring-2 ring-golf-200"
              : "border-gray-200 bg-white hover:border-golf-400 hover:bg-golf-50"
          }`}
        >
          <svg className="w-12 h-12 text-golf-600 scale-x-[-1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m-10.562-1.5h-.018" />
          </svg>
          <p className="text-xl font-semibold text-gray-900">Left-Handed</p>
        </button>
      </div>

      <div className="flex justify-start mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
      </div>
    </div>
  );
};

export default GuestHandedness;
