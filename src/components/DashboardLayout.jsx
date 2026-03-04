import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 p-6 hidden md:flex flex-col">

        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-10">
          AI Dev SaaS
        </h2>

        <nav className="space-y-4 flex-1">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "block text-indigo-400 font-semibold"
                : "block text-gray-400 hover:text-white"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/ai-tools"
            className={({ isActive }) =>
              isActive
                ? "block text-indigo-400 font-semibold"
                : "block text-gray-400 hover:text-white"
            }
          >
            AI Tools
          </NavLink>
        <NavLink
          to="/github"
          className={({ isActive }) =>
            isActive
              ? "block text-indigo-400 font-semibold"
              : "block text-gray-400 hover:text-white"
          }
        >
          GitHub
        </NavLink>
          <div className="text-gray-400 hover:text-white cursor-pointer">
            Projects
          </div>

          <div className="text-gray-400 hover:text-white cursor-pointer">
            Analytics
          </div>
        </nav>

        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="mt-6 bg-gradient-to-r from-red-500 to-red-600 py-2 rounded-lg hover:opacity-90"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 bg-gradient-to-br from-black via-gray-950 to-black">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;