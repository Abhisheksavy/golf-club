import { useState } from "react";
import { useRequestMagicLink, usePasswordLogin } from "../hooks/useAuth";

type Tab = "link" | "password";

const Login = () => {
  const [tab, setTab] = useState<Tab>("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    mutate: sendMagicLink,
    isPending: isSendingLink,
    isSuccess: linkSent,
  } = useRequestMagicLink();

  const { mutate: loginPassword, isPending: isLoggingIn } = usePasswordLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "link") {
      if (email.trim()) sendMagicLink(email);
    } else {
      if (email.trim() && password) loginPassword({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Continue with Email</h1>

        {/* Tab toggle */}
        <div className="flex rounded-full bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab("link")}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              tab === "link"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email Link
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              tab === "password"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
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
                <div className="bg-golf-50 text-golf-700 p-4 rounded-md mb-4">
                  Magic link sent! Check your email to sign in.
                </div>
                <p className="text-sm text-gray-500">The link will expire in 15 minutes.</p>
              </div>
            ) : (
              <>
                <p className="text-center text-sm text-gray-600 mb-4">
                  Enter your email to receive a secure login link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email-link" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email-link"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-field"
                    />
                  </div>
                  <button type="submit" disabled={isSendingLink} className="w-full btn-primary">
                    {isSendingLink ? "Sending..." : "Send Magic Link"}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {/* Password tab */}
        {tab === "password" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-pw" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email-pw"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full btn-primary">
              {isLoggingIn ? "Signing in..." : "Continue"}
            </button>
            <p className="text-xs text-gray-500 text-center">
              New here? Just enter your email and a password — your account is created automatically.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
