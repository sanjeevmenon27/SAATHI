import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";

export const ProfileSetupPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    profilePhoto: user?.profilePhoto || "",
    bio: user?.saathiProfile?.bio || "",
    languagesSpoken: user?.saathiProfile?.languagesSpoken?.join(", ") || "",
    aadharNumber: user?.saathiProfile?.aadharNumber || ""
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await updateProfile({
      ...form,
      languagesSpoken: form.languagesSpoken
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    });
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
        <SectionCard title="Profile setup" subtitle="Review the basics so matching and communication stay accurate.">
          <form onSubmit={handleSubmit} className="space-y-5">
            {["name", "phone", "address", "profilePhoto"].map((field) => (
              <label key={field} className="block">
                <span className="mb-2 block text-lg font-semibold">
                  {field === "profilePhoto" ? "Profile photo URL" : field[0].toUpperCase() + field.slice(1)}
                </span>
                <input
                  type={field === "phone" ? "tel" : field === "profilePhoto" ? "url" : "text"}
                  inputMode={field === "phone" ? "tel" : field === "profilePhoto" ? "url" : "text"}
                  className="input"
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                />
              </label>
            ))}

            {user?.role === "saathi" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">Bio</span>
                  <textarea
                    rows="4"
                    className="input"
                    value={form.bio}
                    onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">Aadhar Number (12 digits)</span>
                  <input
                    required
                    type="text"
                    pattern="[0-9]{12}"
                    maxLength="12"
                    placeholder="Enter 12-digit Aadhar number"
                    className="input"
                    value={form.aadharNumber}
                    onChange={(event) => {
                      const val = event.target.value.replace(/\D/g, "");
                      setForm((current) => ({ ...current, aadharNumber: val }));
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">Languages spoken</span>
                  <input
                    className="input"
                    value={form.languagesSpoken}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, languagesSpoken: event.target.value }))
                    }
                  />
                </label>
              </>
            ) : null}

            <button type="submit" className="btn-primary w-full">
              Save and continue
            </button>
          </form>
        </SectionCard>
      </div>
    </Layout>
  );
};
