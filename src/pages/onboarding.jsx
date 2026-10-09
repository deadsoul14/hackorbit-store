
import { useState } from "react";
import {
  Store,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ImagePlus,
} from "lucide-react";

const categories = [
  "Fashion & Clothing",
  "Electronics",
  "Home & Living",
  "Beauty & Personal Care",
  "Food & Beverages",
  "Jewellery & Accessories",
  "Sports & Fitness",
  "Other",
];

export default function Onboarding({ onComplete }) {
  const [form, setForm] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    category: "",
    description: "",
    address: "",
  });

  const [logo, setLogo] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const slug = form.storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  }

  function handleLogo(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose a logo smaller than 2 MB.");
      return;
    }

    setLogo(URL.createObjectURL(file));
    setError("");
  }

  function continueToNextStep(event) {
    event.preventDefault();

    if (!form.storeName.trim() || !form.ownerName.trim()) {
      setError("Please enter your store name and your name.");
      return;
    }

    if (!form.email.trim() || !form.category) {
      setError("Please enter your email and select a category.");
      return;
    }

    setStep(2);
    setError("");
  }

  function createStore(event) {
    event.preventDefault();

    if (!form.phone.trim()) {
      setError("Please enter a contact number.");
      return;
    }

    const storeData = {
      ...form,
      slug,
      logo,
      theme: "atelier",
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "launchStoreSetup",
        JSON.stringify(storeData)
      );
    } catch {
      setError("Unable to save your setup in this browser.");
      return;
    }

    if (onComplete) {
      onComplete(storeData);
    } else {
      setError(
        "Your setup is saved in this browser. Connect this page to your dashboard to continue."
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#E9DCD2] bg-white px-4 py-3 text-sm text-[#282321] outline-none transition focus:border-[#E3342F] focus:ring-2 focus:ring-[#E3342F]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#39302C]";

  return (
    <div className="min-h-screen bg-[#F8F3EC] text-[#282321]">
      <header className="flex items-center justify-between border-b border-[#E9DCD2] bg-white px-5 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E3342F] text-white">
            <Store size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Launch<span className="text-[#E3342F]">Store</span>
            </h1>
            <p className="text-xs text-[#766963]">
              Your business, beautifully online
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-[#FBE5D8] px-4 py-2 text-xs font-semibold text-[#9E3529] sm:flex">
          <Sparkles size={14} />
          Store setup
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <section className="pt-2 lg:pt-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E9DCD2] bg-white px-3 py-2 text-xs font-semibold text-[#766963]">
            <span className="h-2 w-2 rounded-full bg-[#E3342F]" />
            STEP {step} OF 2
          </div>

          <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Turn your idea into an{" "}
            <span className="text-[#E3342F]">online store.</span>
          </h2>

          <p className="mt-5 max-w-md text-base leading-7 text-[#766963]">
            Tell us a little about your business. We'll help you set
            up your store so you can start showcasing your products.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3342F] text-white">
              {step > 1 ? <CheckCircle2 size={20} /> : "1"}
            </div>

            <div>
              <p className="text-sm font-bold">Your business</p>
              <p className="text-xs text-[#766963]">
                Name, category and contact
              </p>
            </div>
          </div>

          <div className="ml-5 h-8 border-l-2 border-dashed border-[#E9DCD2]" />

          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              step === 2
                ? "bg-[#E3342F] text-white"
                : "bg-white text-[#766963]"
            }`}>
              2
            </div>

            <div>
              <p className="text-sm font-bold">Store details</p>
              <p className="text-xs text-[#766963]">
                Contact number and address
              </p>
            </div>
          </div>

          <div className="mt-10 hidden rounded-3xl border border-[#E9DCD2] bg-white p-5 sm:block">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBE5D8] text-[#E3342F]">
                <ShoppingBag size={23} />
              </div>

              <div>
                <p className="font-bold">Your store, your rules.</p>
                <p className="mt-1 text-sm text-[#766963]">
                  Customize your storefront after setup.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#E9DCD2] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7">
            <h3 className="text-2xl font-bold">
              {step === 1
                ? "Tell us about your store"
                : "Almost there!"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#766963]">
              {step === 1
                ? "Start with the essentials. You can update these details later."
                : "Add your contact number and business address to finish the setup."}
            </p>
          </div>

          <form
            onSubmit={
              step === 1 ? continueToNextStep : createStore
            }
          >
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Store name *</label>
                  <input
                    className={inputClass}
                    name="storeName"
                    value={form.storeName}
                    onChange={updateField}
                    placeholder="e.g. Ember Studio"
                    required
                  />

                  <p className="mt-2 text-xs text-[#766963]">
                    Your store URL preview:{" "}
                    <span className="font-semibold text-[#E3342F]">
                      launchstore.example/{slug || "your-store"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Your name *</label>
                  <input
                    className={inputClass}
                    name="ownerName"
                    value={form.ownerName}
                    onChange={updateField}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Business category *
                  </label>
                  <select
                    className={inputClass}
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select your category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Email address *</label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766963]"
                    />
                    <input
                      className={`${inputClass} pl-11`}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Store logo (optional)
                  </label>

                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[#DCCBC0] bg-[#FDF9F5] p-4 transition hover:border-[#E3342F]">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FBE5D8] text-[#E3342F]">
                      {logo ? (
                        <img
                          src={logo}
                          alt="Store logo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus size={24} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {logo ? "Change your logo" : "Upload your logo"}
                      </p>
                      <p className="mt-1 text-xs text-[#766963]">
                        PNG, JPG or WEBP · Maximum 2 MB
                      </p>
                    </div>

                    <Upload size={18} className="text-[#766963]" />

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    Contact number *
                  </label>
                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766963]"
                    />
                    <input
                      className={`${inputClass} pl-11`}
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={updateField}
                      placeholder="Enter your contact number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Business address (optional)
                  </label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-4 text-[#766963]"
                    />
                    <textarea
                      className={`${inputClass} min-h-28 resize-y pl-11`}
                      name="address"
                      value={form.address}
                      onChange={updateField}
                      placeholder="Street, city, state"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Short business description (optional)
                  </label>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    placeholder="What makes your store special?"
                  />
                </div>

                <div className="rounded-2xl bg-[#FDF4ED] p-4">
                  <p className="text-sm font-bold">Store summary</p>
                  <p className="mt-2 text-sm text-[#766963]">
                    <strong className="text-[#282321]">
                      {form.storeName}
                    </strong>
                    {" · "}
                    {form.category}
                  </p>
                  <p className="mt-1 break-all text-xs text-[#E3342F]">
                    launchstore.example/{slug}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#E9DCD2] px-4 py-3 text-sm font-semibold transition hover:bg-[#F8F3EC]"
                >
                  <ArrowLeft size={17} />
                  Back
                </button>
              )}

              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E3342F] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#B92320]"
              >
                {step === 1 ? "Continue" : "Create my store"}
                <ArrowRight size={17} />
              </button>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-[#766963]">
              Your store details can be updated later from your dashboard.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
