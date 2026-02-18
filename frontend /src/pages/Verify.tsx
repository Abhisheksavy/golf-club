import { useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import { useVerifyMagicLink } from "../hooks/useAuth";

const Verify = () => {
  // const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useVerifyMagicLink();

  // const token = searchParams.get("token");
  const token = "34284ece639a148a8b6ecb0911d134753f663041db2eb5a9e1482605ee3d1e83"

  useEffect(() => {
    if (token) {
      mutate(token);
    } else {
      navigate("/login");
    }
  }, [token, mutate, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        {isPending && (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-golf-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Verifying your login...</p>
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
