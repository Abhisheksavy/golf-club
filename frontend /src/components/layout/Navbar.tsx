import { NavLink } from "react-router-dom";
import { getStoredUser, useLogout } from "../../hooks/useAuth";

const Navbar = () => {
  const user = getStoredUser();
  const logout = useLogout();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-golf-800 text-white"
        : "text-golf-100 hover:bg-golf-600"
    }`;

  return (
    <nav className="bg-golf-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold tracking-tight">Golf Club</span>
          <div className="flex gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/my-bags" className={linkClass}>
              My Bags
            </NavLink>
            <NavLink to="/reserve/course" className={linkClass}>
              Reserve Clubs
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-golf-200 hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm border border-golf-500 rounded-md hover:bg-golf-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
