import { useState } from "react";
import { useRequestMagicLink } from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useRequestMagicLink();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      mutate(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center ">Continue with Email</h1>

        {isSuccess ? (
          <div className="text-center">
            <div className="bg-golf-50 text-golf-700 p-4 rounded-md mb-4">
              Magic link sent! Check your email to sign in.
            </div>
            <p className="text-sm text-gray-500">
              The link will expire in 15 minutes.
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-gray-600 m-2">
              Enter your email to receive a secure login link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full btn-primary"
              >
                {isPending ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
