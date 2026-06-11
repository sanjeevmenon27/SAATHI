import { HeartHandshake, Home, LogIn, LogOut, Menu, Settings, UserRound, UserRoundCog, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLockBodyScroll } from "./useLockBodyScroll";
import { ApiSettingsModal } from "./ApiSettingsModal";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const primaryLinks = useMemo(() => {
    if (user) {
      return [
        { to: "/", label: "Home", icon: Home },
        { to: "/dashboard", label: "Dashboard", icon: UserRoundCog },
        { to: "/profile-setup", label: "Profile", icon: UserRound }
      ];
    }

    return [
      { to: "/", label: "Home", icon: Home },
      { to: "/login", label: "Login", icon: LogIn },
      { to: "/register", label: "Join", icon: UserRound }
    ];
  }, [user]);

  useLockBodyScroll(isMenuOpen);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-saffron-100 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 text-cocoa-900">
            <div className="rounded-2xl bg-saffron-500 p-2.5 text-white shadow-card">
              <HeartHandshake size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold sm:text-2xl">SaathiCare</div>
              <div className="text-xs text-cocoa-700 sm:text-sm">Care companion booking</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-base font-semibold transition ${
                    isActive ? "bg-saffron-100 text-saffron-700" : "text-cocoa-700 hover:bg-white hover:text-cocoa-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 shadow-card sm:flex">
                <UserRound size={18} className="text-saffron-700" />
                <span className="max-w-44 truncate text-sm font-semibold text-cocoa-900">{user.name}</span>
              </div>
            ) : null}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-saffron-300 bg-white px-4 py-2.5 text-cocoa-900 transition hover:bg-cream-50 md:inline-flex"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <NavLink to="/register" className="btn-primary hidden md:inline-flex">
                Join Now
              </NavLink>
            )}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex rounded-2xl border border-saffron-200 bg-white p-3 text-cocoa-900 shadow-card transition active:scale-[0.98]"
              aria-label="API Settings"
            >
              <Settings size={20} />
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex rounded-2xl border border-saffron-200 bg-white p-3 text-cocoa-900 shadow-card transition active:scale-[0.98] md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-30 bg-cocoa-900/30 transition duration-300 md:hidden ${
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-40 h-full w-[min(88vw,22rem)] bg-white px-5 pb-8 pt-24 shadow-card transition duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-3">
          {user ? (
            <div className="rounded-[28px] bg-cream-50 p-4 ring-1 ring-saffron-100">
              <div className="text-sm text-cocoa-700">Signed in as</div>
              <div className="mt-1 text-lg font-bold">{user.name}</div>
            </div>
          ) : null}

          <nav className="space-y-2">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition ${
                      isActive ? "bg-saffron-100 text-saffron-700" : "bg-cream-50 text-cocoa-900"
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {user ? (
            <button type="button" onClick={handleLogout} className="btn-secondary w-full">
              <LogOut size={18} />
              Logout
            </button>
          ) : null}
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-saffron-100 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-xs font-semibold transition ${
                    isActive ? "bg-saffron-100 text-saffron-700" : "text-cocoa-700"
                  }`
                }
              >
                <Icon size={18} />
                <span className="mt-1">{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
      <ApiSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
