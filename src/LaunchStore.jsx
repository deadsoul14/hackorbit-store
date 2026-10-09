
import { useState } from "react";
import App from "./App";
import Onboarding from "./pages/onboarding";
import Auth from "./Auth";
import { getMyStore } from "./lib/getMyStore";
import { createStore } from "./lib/stores";
import { signOut } from "./lib/auth";

function getSavedStore() {
  try {
    return JSON.parse(
      localStorage.getItem("launchStoreSetup") || "null"
    );
  } catch {
    return null;
  }
}

export default function LaunchStore() {
  const [storeData, setStoreData] = useState(getSavedStore);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [databaseStore, setDatabaseStore] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleComplete(data) {
    setStoreData(data);
    window.location.reload();
  }

  async function handleAuthenticated(authUser) {
    setUser(authUser);
    setMessage("");
    setLoading(true);

    try {
      const result = await getMyStore();

      if (result.error) {
        setMessage(`Store lookup failed: ${result.error.message}`);
        return;
      }

      setDatabaseStore(result.store);
      if (result.store) {
  localStorage.setItem(
    "launchDatabaseStoreName",
    result.store.name
  );
}

      if (!result.store) {
        setStoreName(storeData?.storeName || "");
        setMessage("You're signed in. Create your database store below.");
      }
    } catch (error) {
      setMessage(error.message || "Could not look up your store.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStore(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await createStore(storeName);

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      setDatabaseStore(result.store);
      setMessage("Your database store was created successfully.");
    } catch (error) {
      setMessage(error.message || "Could not create your store.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await signOut();

      if (error) {
        setMessage(error.message);
        return;
      }

      setUser(null);
      setDatabaseStore(null);
      setShowAuth(true);
      setMessage("You have signed out.");
    } catch (error) {
      setMessage(error.message || "Sign-out failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!storeData) {
    return <Onboarding onComplete={handleComplete} />;
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-[#fbf4ed]">
        {!user ? (
          <Auth onAuthenticated={handleAuthenticated} />
        ) : (
          <main className="flex min-h-screen items-center justify-center p-5">
            <section className="w-full max-w-lg rounded-3xl border border-[#f0ded0] bg-white p-8 shadow-sm">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#c62822]">
                Launch-Your-Store
              </p>

              <h1 className="mb-2 text-3xl font-bold text-[#29221f]">
                Connect your store
              </h1>

              <p className="mb-6 text-sm text-[#78665d]">
                Signed in as {user.email || user.id}
              </p>

              {loading && (
                <p className="mb-4 text-sm text-gray-600">
                  Please wait...
                </p>
              )}

              {databaseStore ? (
                <div className="rounded-xl bg-green-50 p-4 text-green-800">
                  <h2 className="font-semibold">Database store found</h2>
                  <p className="mt-1">{databaseStore.name}</p>
                  <p className="text-sm">Store ID: {databaseStore.id}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateStore} className="space-y-4">
                  <label
                    htmlFor="database-store-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Store name
                  </label>

                  <input
                    id="database-store-name"
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    required
                    maxLength={100}
                    placeholder="Enter your store name"
                    className="w-full rounded-xl border border-[#e7d7cc] p-3 outline-none focus:border-[#e6322b]"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#e6322b] p-3 font-semibold text-white disabled:opacity-60"
                  >
                    Create database store
                  </button>
                </form>
              )}

              {message && (
                <p role="status" className="mt-4 text-sm text-gray-700">
                  {message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="flex-1 rounded-xl border border-[#e7d7cc] p-3 font-medium"
                >
                  Back to dashboard
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-[#e7d7cc] p-3 font-medium disabled:opacity-60"
                >
                  Sign out
                </button>
              </div>
            </section>
          </main>
        )}
      </div>
    );
  }

  return (
    <>
      <App />

      <button
        type="button"
        onClick={() => {
          setShowAuth(true);
          setMessage("");
        }}
        className="fixed bottom-4 right-4 z-50 rounded-xl bg-[#e6322b] px-5 py-3 font-semibold text-white shadow-lg"
      >
        Connect Supabase
      </button>
    </>
  );
}
