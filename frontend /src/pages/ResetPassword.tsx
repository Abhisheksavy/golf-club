import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useResetPassword } from "../hooks/useAuth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [confirmError, setConfirmError] = useState("");

  const { mutate: doReset, isPending } = useResetPassword();

  const validatePassword = (pw: string) => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (!/\d/.test(pw)) errors.push("One number");
    if (!/[\W_]/.test(pw)) errors.push("One special character");
    setPwErrors(errors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwErrors.length > 0) return;
    if (password !== confirm) {
      setConfirmError("Passwords do not match");
      return;
    }
    setConfirmError("");
    doReset({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-golf-dark">
        <div className="max-w-md w-full p-8 bg-white/10 rounded-lg border border-white/20 shadow-md text-center">
          <p className="text-golf-yellow mb-4">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-sm text-golf-yellow underline hover:text-golf-yellow/80">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-dark">
      <div className="max-w-md w-full p-8 bg-white/10 rounded-lg border border-white/20 shadow-md">
        <h1 className="text-2xl text-golf-yellow font-bold text-center mb-6">
          Set New Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-golf-yellow mb-1"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="••••••••"
              required
              className="input-field rounded-full border-golf-yellow placeholder:text-golf-yellow text-golf-yellow"
            />
            {password && pwErrors.length > 0 && (
              <ul className="text-xs text-golf-yellow mt-1 space-y-0.5 list-disc list-inside">
                {pwErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-golf-yellow mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setConfirmError("");
              }}
              placeholder="••••••••"
              required
              className="input-field rounded-full border-golf-yellow placeholder:text-golf-yellow text-golf-yellow"
            />
            {confirmError && (
              <p className="text-golf-yellow text-xs mt-1">{confirmError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending || pwErrors.length > 0}
            className="w-full rounded-full bg-golf-yellow text-[#285610] py-2 text-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-sm text-golf-yellow mt-4">
          <Link to="/login" className="underline hover:text-golf-yellow/80">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
