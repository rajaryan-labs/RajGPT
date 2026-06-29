import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import { assets } from "./assets/assets";
import "./assets/prism.css";
import Loading from "./pages/Loading";
import Login from "./pages/Login";
import { useAppContext } from "./context/AppContext";
import { Toaster } from "react-hot-toast";

/**
 * Main App Component
 * Handles the application routing, theme rendering, and top-level authentication state.
 * Supports guest mode — users can use the app without logging in.
 */
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const { user, loadingUser } = useAppContext();

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => document.body.classList.remove("sidebar-open");
  }, [isMenuOpen]);

  // Show loading screen while user details are being fetched or if on the loading path
  if (pathname === "/loading" || loadingUser) return <Loading />;
  return (
    <>
      <Toaster />
      {/* Hamburger menu button — higher z-index to stay above content */}
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className="fixed top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert z-20"
          onClick={() => {
            setIsMenuOpen(true);
          }}
        />
      )}

      {/* Mobile backdrop overlay when sidebar is open */}
      <div
        className={`sidebar-backdrop md:hidden ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Main Application View — accessible to both guests and authenticated users */}
      <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white h-full">
        <div className="flex h-full w-full">
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <Routes>
            <Route path="/" element={<ChatBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
            <Route
              path="/login"
              element={
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#242124] to-[#000000]">
                  <Login />
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
