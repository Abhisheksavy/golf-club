import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const ClubPreferenceChoice = () => {
  const navigate = useNavigate();
  const { setPreferenceMode } = useRental();

  const handleOwn = () => {
    setPreferenceMode("own");
    navigate("/reserve/clubs");
  };

  const handleGuided = () => {
    setPreferenceMode("guided");
    navigate("/reserve/level");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-2">How would you like to choose clubs?</h1>
      <p className="text-white/60 mb-8">We can help narrow down the options based on your game.</p>

      <div className="grid gap-4">
        <button
          type="button"
          onClick={handleOwn}
          className="flex items-center gap-6 p-8 rounded-xl border-2 border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15 transition-all min-h-[100px] text-left"
        >
          <svg className="w-12 h-12 text-golf-yellow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <div>
            <p className="text-lg font-semibold text-white">I'll choose my own clubs</p>
            <p className="text-sm text-white/60 mt-1">Browse the full selection and pick what you like</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleGuided}
          className="flex items-center gap-6 p-8 rounded-xl border-2 border-white/20 bg-white/10 hover:border-[#FBE118]/50 hover:bg-white/15 transition-all min-h-[100px] text-left"
        >
          <svg className="w-12 h-12 text-golf-yellow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          <div>
            <p className="text-lg font-semibold text-white">Help me narrow it down</p>
            <p className="text-sm text-white/60 mt-1">Answer a couple of questions and we'll suggest the right clubs</p>
          </div>
        </button>
      </div>

      <div className="flex justify-start mt-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
      </div>
    </div>
  );
};

export default ClubPreferenceChoice;
