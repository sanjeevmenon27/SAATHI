import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Unable to connect to the server. Please make sure the backend server is running.");
      } else {
        setError(err.response?.data?.message || "Unable to login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
        <SectionCard title="Welcome back" subtitle="Login as family member, Saathi, or admin.">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="current-password"
                className="input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 rounded-3xl bg-cream-50 p-5 text-sm leading-7 text-cocoa-700 sm:text-base">
            Demo users: `meenakshi@example.com`, `kalaivani@example.com`, `admin@saathicare.com`
            with password `password123`.
          </div>

          <p className="mt-5 text-center text-cocoa-700">
            Need an account?{" "}
            <Link to="/register" className="font-semibold text-saffron-700">
              Create one
            </Link>
          </p>
        </SectionCard>
      </div>
    </Layout>
  );
};
