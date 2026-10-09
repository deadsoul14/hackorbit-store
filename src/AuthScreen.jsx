
import { useState } from "react";
import { signIn, signUp } from "./lib/auth";

export default function AuthScreen({
  onAuthenticated,
  onContinueLocalDemo,
}) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } =
        mode === "signup"
          ? await signUp(cleanEmail, password)
          : await signIn(cleanEmail, password);

      if (error) {
        throw error;
      }

      if (mode === "signup" && !data.session) {
        setMessage(
          "Account created! Check your email for a confirmation link. After confirming, return here and sign in."
        );
        setMode("signin");
        setPassword("");
        return;
      }

      if (!data.user) {
        setMessage(
          "Please check your email for confirmation, then sign in."
        );
        return;
      }

      setMessage("Authentication successful!");

      if (onAuthenticated) {
        onAuthenticated(data.user);
      }
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf5ef] px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-[#f0dfd2] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fde5d8] text-2xl">
            ✦
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-[#c52b25]">
            Launch Your Store
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#29211e]">
            {mode === "signup"
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p className="mt-2 text-sm text-[#78665d]">
            {mode === "signup"
              ? "Create an account to start building your store."
              : "Sign in to continue to your store."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#fbf5ef] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage("");
              setErrorMessage("");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              mode === "signin"
                ? "bg-white text-[#c52b25] shadow-sm"
                : "text-[#78665d]"
            }`}
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
              setErrorMessage("");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              mode === "signup"
                ? "bg-white text-[#c52b25] shadow-sm"
                : "text-[#78665d]"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1 block text-sm font-medium text-[#443832]"
            >
              Email address
            </label>

            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-[#e9d9cd] px-4 py-3 outline-none focus:border-[#c52b25] focus:ring-2 focus:ring-[#c52b25]/10"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-sm font-medium text-[#443832]"
            >
              Password
            </label>

            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "signup"
                  ? "new-password"
                  : "current-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              minLength={6}
              required
              className="w-full rounded-xl border border-[#e9d9cd] px-4 py-3 outline-none focus:border-[#c52b25] focus:ring-2 focus:ring-[#c52b25]/10"
            />

            <p className="mt-1 text-xs text-[#78665d]">
              Use at least 6 characters.
            </p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-xl bg-green-50 p-3 text-sm text-green-800"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#e8322b] px-4 py-3 font-semibold text-white transition hover:bg-[#c52b25] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {onContinueLocalDemo && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#eee0d6]" />
              <span className="text-xs text-[#927f74]">
                OR
              </span>
              <div className="h-px flex-1 bg-[#eee0d6]" />
            </div>

            <button
              type="button"
              onClick={onContinueLocalDemo}
              className="w-full rounded-xl border border-[#e9d9cd] px-4 py-3 font-semibold text-[#443832] hover:bg-[#fbf5ef]"
            >
              Continue with local demo
            </button>
          </>
        )}
      </section>
    </main>
  );
}
