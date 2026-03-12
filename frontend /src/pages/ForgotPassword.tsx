import { useState } from "react";
import { Link } from "react-router-dom";
import { useRequestPasswordReset } from "../hooks/useAuth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate: sendReset, isPending } = useRequestPasswordReset();

  const validateEmail = (v: string) => {
    setEmailError(EMAIL_REGEX.test(v) ? "" : "Enter a valid email address");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    sendReset(email, {
      onSuccess: () => setSubmitted(true),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-dark">
      <div className="max-w-md w-full p-8 bg-white/10 rounded-lg border border-white/20 shadow-md">
        <h1 className="text-2xl text-golf-yellow font-bold text-center mb-6">
          Reset Password
        </h1>

        {submitted ? (
          <div className="text-center">
            <div className="bg-[#FBE118]/20 text-golf-yellow p-4 rounded-md mb-4">
              Check your email for a password reset link.
            </div>
            <p className="text-sm text-golf-yellow mb-4">
              The link will expire in 60 minutes.
            </p>
            <Link to="/login" className="text-sm text-golf-yellow underline hover:text-golf-yellow/80">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-golf-yellow mb-4">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-golf-yellow mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field rounded-full border-golf-yellow placeholder:text-golf-yellow text-golf-yellow"
                />
                {emailError && (
                  <p className="text-golf-yellow text-xs mt-1">{emailError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-golf-yellow text-[#285610] py-2 text-md"
              >
                {isPending ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center text-sm text-golf-yellow mt-4">
              <Link to="/login" className="underline hover:text-golf-yellow/80">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
