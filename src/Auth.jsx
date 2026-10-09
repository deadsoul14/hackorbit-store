
import { useState } from "react";
import { signIn, signUp } from "./lib/auth";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result =
        mode === "signup"
          ? await signUp(email.trim(), password)
          : await signIn(email.trim(), password);

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        setMessage(
          "Account created. Confirm your email, then return here and sign in."
        );
        return;
      }

      if (result.data.user) {
        onAuthenticated?.(result.data.user);
      } else {
        setMessage("Authentication succeeded, but no user was returned.");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf4ed] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[#f0ded0] bg-white p-8 shadow-sm"
      >
        <h1 className="mb-2 text-3xl font-bold text-[#29221f]">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mb-6 text-sm text-[#78665d]">
          Sign in to manage your Launch-Your-Store workspace.
        </p>

        <label className="mb-2 block text-sm font-medium" htmlFor="auth-email">
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 w-full rounded-lg border border-[#e7d7cc] p-3 outline-none focus:border-[#e6322b]"
          placeholder="you@example.com"
        />

        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="auth-password"
        >
          Password
        </label>

        <div className="mb-4 flex overflow-hidden rounded-lg border border-[#e7d7cc] focus-within:border-[#e6322b]">
          <input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-w-0 flex-1 p-3 outline-none"
            placeholder="At least 6 characters"
          />

          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="px-3 text-sm font-semibold text-[#c62822] hover:bg-[#fbf4ed]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {message && (
          <p role="status" className="mb-4 text-sm text-[#b42318]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#e6322b] p-3 font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>

        <p className="mt-5 text-center text-sm text-[#78665d]">
          {mode === "signup"
            ? "Already have an account?"
            : "New to Launch-Your-Store?"}{" "}
          <button
            type="button"
            className="font-semibold text-[#c62822] underline"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setMessage("");
            }}
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </form>
    </div>
  );
}
