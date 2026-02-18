import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";

const RentalConfirmation = () => {
  const navigate = useNavigate();
  const { selectedCourse, reset } = useRental();

  const handleDashboard = () => {
    reset();
    navigate("/dashboard");
  };

  const handleNewReservation = () => {
    reset();
    navigate("/reserve/course");
  };

  const handleViewBags = () => {
    reset();
    navigate("/my-bags");
  };

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h1>
      <p className="text-gray-500 mb-8">
        {selectedCourse
          ? `Your clubs are reserved at ${selectedCourse.name}.`
          : "Your reservation has been confirmed."}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={handleDashboard} className="btn-primary">
          Back to Dashboard
        </button>
        <button onClick={handleNewReservation} className="btn-secondary">
          Make Another Reservation
        </button>
        <button onClick={handleViewBags} className="btn-secondary">
          View My Bags
        </button>
      </div>
    </div>
  );
};

export default RentalConfirmation;
