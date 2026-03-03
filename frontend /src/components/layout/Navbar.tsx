import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getStoredUser, useLogout, isAuthenticated } from "../../hooks/useAuth";

const Navbar = () => {
  const user = getStoredUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 pt-2  text-base font-medium transition-all text-golf-yellow border-b ${
      isActive ? "border-golf-yellow" : "border-transparent "
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-sm font-medium transition-colors border-b border-[#FBE118]/20 ${
      isActive
        ? "bg-dark-blue text-golf-yellow"
        : "text-golf-yellow hover:bg-golf-yellow"
    }`;

  return (
    <nav className="bg-golf-dark text-charcoal ">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="https://www.firestx.com/"
          className="text-lg font-bold tracking-tight text-golf-yellow transition-colors whitespace-nowrap"
        >
          <img
            src="https://images.squarespace-cdn.com/content/v1/69727db21fefbc03b1e14f00/8c0977ec-66a5-4340-b6c0-604cf8b5a7cc/GOLD_FireStx+logo+-+centered+-+cropped+no+background+-+larger+emblem+-+brand+only+-+gold.png?format=50w"
            className="w-auto max-w-full max-h-12"
          />
        </Link>

        {/* Desktop nav links (≥768px) */}
        <div className="hidden md:flex items-end justify-end gap-1 ml-6 flex-1">
          <Link
            to="https://www.firestx.com/"
            className="px-3 pt-2 text-base font-medium text-golf-yellow border-b border-transparent hover:border-golf-yellow/50 transition-all"
          >
            Home
          </Link>
          <NavLink to="/my-bags" className={linkClass}>
            My Bags
          </NavLink>
          <NavLink to="/my-reservations" className={linkClass}>
            My Reservations
          </NavLink>
          <NavLink to="/reserve/course" className={linkClass}>
            Reserve Clubs
          </NavLink>
        </div>

        {/* Desktop auth section (≥768px) */}
        <div className="hidden md:flex items-center gap-4">
          {authed ? (
            <>
              <span className="text-sm text-golf-yellow/70">{user?.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-base border border-[#FBE118]/40 rounded-full  bg-[#EDD287] text-golf-dark  transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 text-base border border-[#FBE118]/40 rounded-full bg-[#EDD287] text-golf-dark transition-colors"
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
              className="px-3 py-1.5 text-sm border border-[#FBE118]/40 rounded-md hover:bg-[#1c3e0c] transition-colors"
            >
              Log In
            </button>
          )}
          {/* Hamburger button */}
          <button
            className="p-2 rounded-md hover:bg-[#1c3e0c] transition-colors"
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
        <div className="md:hidden bg-golf-dark border-t border-[#FBE118]/20">
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
          <NavLink
            to="/reserve/course"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Reserve Clubs
          </NavLink>
          {authed && (
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-golf-yellow truncate mr-3">
                {user?.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex-shrink-0 px-3 py-1.5 text-sm border border-[#FBE118]/40 rounded-md text-golf-yellow transition-colors"
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
