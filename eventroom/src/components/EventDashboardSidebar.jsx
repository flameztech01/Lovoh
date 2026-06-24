// components/EventDashboardSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authslice";
import {
  FaCalendarAlt,
  FaPlus,
  FaList,
  FaTicketAlt,
  FaWallet,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaChartBar,
  FaUsers, // <-- NEW import
} from "react-icons/fa";
import { toast } from "react-toastify";

const EventDashboardSidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [logoutMutation] = useLogoutMutation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: FaHome,
      path: "/dashboard",
    },
    {
      title: "My Events",
      icon: FaList,
      path: "/dashboard/events",
    },
    {
      title: "Create Event",
      icon: FaPlus,
      path: "/dashboard/events/new",
    },
    {
      title: "Registrations",
      icon: FaTicketAlt,
      path: "/dashboard/registrations",
    },
    {
      title: "Wallet",
      icon: FaWallet,
      path: "/dashboard/wallet",
    },
    // NEW TEAM MENU ITEM
    {
      title: "Team",
      icon: FaUsers,
      path: "/dashboard/team",
    },
    {
      title: "Analytics",
      icon: FaChartBar,
      path: "/dashboard/analytics",
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.log("Backend logout failed, clearing locally");
    }

    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    toast.success("Logged out successfully");
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-[#1B3766]"
          >
            {sidebarOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
          <span className="font-bold text-[#1B3766]">Event Dashboard</span>
          <div className="w-8 h-8 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold">
            {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link
            to="/events/dashboard"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#1B3766] to-blue-700 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">EventRoom</h2>
              <p className="text-xs text-gray-500">Creator Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-[#1B3766] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1B3766]"
              }`}
            >
              <item.icon
                className={`text-sm ${isActive(item.path) ? "text-white" : "text-gray-400"}`}
              />
              {item.title}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3766] to-blue-700 text-white flex items-center justify-center text-sm font-bold">
              {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userInfo?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userInfo?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <FaSignOutAlt className="text-xs" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default EventDashboardSidebar;
