import { Navigate, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../hooks/useAuth";
import { useRental } from "../../context/RentalContext";

const AuthChoice = () => {
  const navigate = useNavigate();
  const { setIsGuest } = useRental();

  // Authenticated users skip the choice and go straight to bag selection
  if (isAuthenticated()) {
    return <Navigate to="/reserve/bag-select" replace />;
  }

  const handleLogin = () => {
    sessionStorage.setItem("returnTo", "/reserve/bag-select");
    navigate("/login");
  };

  const handleGuest = () => {
    setIsGuest(true);
    navigate("/reserve/handedness");
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">How would you like to continue?</h1>
      <p className="text-gray-500 mb-8">Log in to use your saved bags or continue as a guest to pick clubs now.</p>

      <div className="space-y-4">
        <button
          onClick={handleLogin}
          className="w-full btn-primary py-3 text-base"
        >
          Log In
        </button>

        <button
          onClick={handleGuest}
          className="w-full btn-secondary py-3 text-base"
        >
          Continue as Guest
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Guests can select clubs now and log in later to save their bag.
      </p>
    </div>
  );
};

export default AuthChoice;
