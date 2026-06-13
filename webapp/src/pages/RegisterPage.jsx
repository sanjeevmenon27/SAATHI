import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { serviceOptions } from "../data";

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const initialRole = useMemo(() => searchParams.get("role") || "elder_family", [searchParams]);
  const [form, setForm] = useState({
    role: initialRole,
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    profilePhoto: "",
    bio: "",
    languagesSpoken: "",
    skills: [],
    aadharNumber: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        ...form,
        languagesSpoken: form.languagesSpoken
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      });
      navigate("/profile-setup");
    } catch (err) {
      if (!err.response) {
        setError("Unable to connect to the server. Please make sure the backend server is running.");
      } else {
        setError(err.response?.data?.message || "Unable to register");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill]
    }));
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
        <SectionCard title="Create your SaathiCare account" subtitle="Register as a family requester or as a Saathi.">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-lg font-semibold">Role</span>
                <select
                  className="input"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="elder_family">Elder / Family Member</option>
                  <option value="saathi">Saathi / Companion</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-lg font-semibold">Full name</span>
                <input
                  required
                  autoComplete="name"
                  className="input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-lg font-semibold">Email</span>
                <input
                  required
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="input"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-lg font-semibold">Password</span>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-lg font-semibold">Phone</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="input"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-lg font-semibold">Address</span>
                <input
                  autoComplete="street-address"
                  className="input"
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-lg font-semibold">Profile photo URL</span>
              <input
                type="url"
                inputMode="url"
                className="input"
                value={form.profilePhoto}
                onChange={(event) => setForm((current) => ({ ...current, profilePhoto: event.target.value }))}
              />
            </label>

            {form.role === "saathi" ? (
              <>
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
                  <span className="mb-2 block text-lg font-semibold">Short bio</span>
                  <textarea
                    rows="4"
                    className="input"
                    value={form.bio}
                    onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">Languages spoken</span>
                  <input
                    className="input"
                    placeholder="Tamil, English"
                    value={form.languagesSpoken}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, languagesSpoken: event.target.value }))
                    }
                  />
                </label>
                <div>
                  <span className="mb-3 block text-lg font-semibold">Skills</span>
                  <div className="flex flex-wrap gap-3">
                    {serviceOptions.map((service) => (
                      <button
                        key={service.name}
                        type="button"
                        onClick={() => toggleSkill(service.name)}
                        className={`min-h-12 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] sm:text-base ${
                          form.skills.includes(service.name)
                            ? "bg-saffron-500 text-white"
                            : "bg-cream-100 text-cocoa-900"
                        }`}
                      >
                        {service.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}

            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-5 text-center text-cocoa-700">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-saffron-700">
              Login
            </Link>
          </p>
        </SectionCard>
      </div>
    </Layout>
  );
};
