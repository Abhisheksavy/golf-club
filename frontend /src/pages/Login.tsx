import { useState } from "react";
import { Link } from "react-router-dom";
import { useRequestMagicLink, usePasswordLogin } from "../hooks/useAuth";

type Tab = "link" | "password";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [tab, setTab] = useState<Tab>("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");

  const {
    mutate: sendMagicLink,
    isPending: isSendingLink,
    isSuccess: linkSent,
  } = useRequestMagicLink();

  const { mutate: loginPassword, isPending: isLoggingIn } = usePasswordLogin();

  const validatePassword = (pw: string) => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (!/\d/.test(pw)) errors.push("One number");
    if (!/[\W_]/.test(pw)) errors.push("One special character");
    setPwErrors(errors);
  };

  const validateEmail = (v: string) => {
    setEmailError(EMAIL_REGEX.test(v) ? "" : "Enter a valid email address");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "link") {
      if (email.trim()) sendMagicLink(email);
    } else {
      if (pwErrors.length > 0) return;
      if (email.trim() && password) loginPassword({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-dark">
      <div className="max-w-md w-full p-8 bg-white/10 rounded-lg border border-white/20 shadow-md">
        <h1 className="text-2xl text-golf-yellow font-bold text-center mb-6">
          Continue with Email
        </h1>

        {/* Tab toggle */}
        <div className="flex rounded-full bg-white/10 p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab("link")}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              tab === "link"
                ? "bg-golf-yellow text-[#285610] shadow"
                : "text-golf-yellow hover:text-golf-yellow"
            }`}
          >
            Email Link
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              tab === "password"
                ? "bg-[#FBE118] text-golf-dark"
                : "text-golf-yellow hover:text-golf-yellow"
            }`}
          >
            Password
          </button>
        </div>

        {/* Email Link tab */}
        {tab === "link" && (
          <>
            {linkSent ? (
              <div className="text-center">
                <div className="bg-[#FBE118]/20 text-golf-yellow p-4 rounded-md mb-4">
                  Magic link sent! Check your email to sign in.
                </div>
                <p className="text-sm text-golf-yellow">
                  The link will expire in 15 minutes.
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-sm text-golf-yellow mb-4">
                  Enter your email to receive a secure login link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email-link"
                      className="block text-sm font-medium text-golf-yellow mb-1 "
                    >
                      Email Address
                    </label>
                    <input
                      id="email-link"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => validateEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-field rounded-full border-golf-yellow placeholder:text-golf-yellow text-golf-yellow"
                    />
                    {emailError && (
                      <p className="text-golf-yellow text-xs mt-1">
                        {emailError}
                      </p>
                    )}
                  </div>
                  {/* className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              tab === "link"
                ? "bg-[#EDD287] text-[#285610] shadow"
                : "text-white/60 hover:text-white"
            }`} */}
                  <button
                    type="submit"
                    disabled={isSendingLink}
                    className="w-full  rounded-full bg-golf-yellow text-[#285610] py-2 text-md"
                  >
                    {isSendingLink ? "Sending..." : "Send Magic Link"}
                  </button>
                </form>
                <p className="text-center text-sm text-golf-yellow mt-4">
                  <Link to="/forgot-password" className="underline hover:text-golf-yellow/80">
                    Forgot password?
                  </Link>
                </p>
              </>
            )}
          </>
        )}

        {/* Password tab */}
        {tab === "password" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email-pw"
                className="block text-sm font-medium text-golf-yellow mb-1"
              >
                Email Address
              </label>
              <input
                id="email-pw"
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
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-golf-yellow mb-1"
              >
                Password
              </label>
              <input
                id="password"
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
              {tab === "password" && password && pwErrors.length > 0 && (
                <ul className="text-xs text-golf-yellow mt-1 space-y-0.5 list-disc list-inside">
                  {pwErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full  rounded-full bg-golf-yellow text-[#285610] py-2 text-md"
            >
              {isLoggingIn ? "Signing in..." : "Continue"}
            </button>
            <p className="text-xs text-golf-yellow text-center">
              New here? Just enter your email and a password — your account is
              created automatically.
            </p>
            <p className="text-center text-sm text-golf-yellow mt-2">
              <Link to="/forgot-password" className="underline hover:text-golf-yellow/80">
                Forgot password?
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
