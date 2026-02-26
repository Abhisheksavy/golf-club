import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getStoredUser, useLogout, isAuthenticated } from "../../hooks/useAuth";

const Navbar = () => {
  const user = getStoredUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive ? "bg-golf-800 text-white" : "text-golf-100 hover:bg-golf-600"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-sm font-medium transition-colors border-b border-golf-600 ${
      isActive ? "bg-golf-800 text-white" : "text-golf-100 hover:bg-golf-600"
    }`;

  return (
    <nav className="bg-golf-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate(authed ? "/dashboard" : "/reserve/course")}
          className="text-lg font-bold tracking-tight hover:text-golf-200 transition-colors whitespace-nowrap"
        >
          Golf Club
        </button>

        {/* Desktop nav links (≥768px) */}
        <div className="hidden md:flex items-center gap-1 ml-6 flex-1">
          {authed && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/my-bags" className={linkClass}>
                My Bags
              </NavLink>
              <NavLink to="/my-reservations" className={linkClass}>
                My Reservations
              </NavLink>
            </>
          )}
          <NavLink to="/reserve/course" className={linkClass}>
            Reserve Clubs
          </NavLink>
        </div>

        {/* Desktop auth section (≥768px) */}
        <div className="hidden md:flex items-center gap-4">
          {authed ? (
            <>
              <span className="text-sm text-golf-200">{user?.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm border border-golf-500 rounded-md hover:bg-golf-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 text-sm border border-golf-500 rounded-md hover:bg-golf-600 transition-colors"
            >
              Log In
            </button>
          )}
        </div>

        {/* Mobile right side (<768px) */}
        <div className="flex items-center gap-2 md:hidden">
          {!authed && (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 text-sm border border-golf-500 rounded-md hover:bg-golf-600 transition-colors"
            >
              Log In
            </button>
          )}
          {/* Hamburger button */}
          <button
            className="p-2 rounded-md hover:bg-golf-600 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu (<768px) */}
      {menuOpen && (
        <div className="md:hidden bg-golf-700 border-t border-golf-600">
          {authed && (
            <>
              <NavLink
                to="/dashboard"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/my-bags"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                My Bags
              </NavLink>
              <NavLink
                to="/my-reservations"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                My Reservations
              </NavLink>
            </>
          )}
          <NavLink
            to="/reserve/course"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Reserve Clubs
          </NavLink>
          {authed && (
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-golf-200 truncate mr-3">
                {user?.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex-shrink-0 px-3 py-1.5 text-sm border border-golf-500 rounded-md hover:bg-golf-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
