import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVerifyMagicLink } from "../hooks/useAuth";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useVerifyMagicLink();

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      mutate(token);
    } else {
      navigate("/login");
    }
  }, [token, mutate, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-dark">
      <div className="max-w-md w-full p-8 bg-white/10 rounded-lg border border-white/20 shadow-md text-center">
        {isPending && (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-golf-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white/60">Verifying your login...</p>
          </>
        )}

        {isError && (
          <div>
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {(error as any)?.response?.data?.message || "Verification failed"}
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-golf-600 hover:underline"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
