import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";
import toast from "react-hot-toast";
import Loading from "../pages/Loading";

/**
 * Sidebar Component
 * Displays the application logo, new chat button, search input for conversations,
 * recent chat history, links to community images, credit purchase, dark mode toggle,
 * and user account/logout actions.
 * Supports guest mode — hides chat history and shows sign-in prompts.
 */
const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    axios,
    setChats,
    fetchUsersChats,
    setToken,
    createNewChat,
    token,
    isGuest,
    guestCredits,
    clearGuestChat,
  } = useAppContext();
  const [search, setSearch] = useState("");

  /**
   * Logs out the user by clearing the token from local storage and app state.
   */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  /**
   * Handles deleting a specific chat.
   * Prompts for confirmation, then calls the backend API.
   * On success, removes the chat from local state and refreshes chat history.
   * @param {Event} e - The click event
   * @param {string} chatId - The ID of the chat to delete
   */
  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm(
        "Are you sure you want to delete this chat ?",
      );
      if (!confirm) return;
      const { data } = await axios.post(
        "/api/chat/delete",
        { chatId },
        { headers: { Authorization: token } },
      );
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        await fetchUsersChats();
        toast.success(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className={`flex flex-col h-full min-w-64 sm:min-w-72 p-4 sm:p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-300 max-md:fixed max-md:inset-y-0 left-0 z-10 max-md:w-72 ${!isMenuOpen && "max-md:-translate-x-full"}`}
    >
      {/* logo */}
      <div
        className="flex items-center gap-3 w-full max-w-48 cursor-pointer mb-2 shrink-0"
        onClick={() => {
          navigate("/");
          setIsMenuOpen(false);
        }}
      >
        <img src={assets.logo} className="w-10 h-10" />
        <div className="flex flex-col">
          <span className="text-[22px] font-bold dark:text-white text-black leading-tight">
            RajGPT
          </span>
          <span className="text-[10px] font-semibold text-[#A456F7] dark:text-primary">
            Intelligent AI Assistant
          </span>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={() => {
          if (isGuest) {
            clearGuestChat();
            navigate("/");
            setIsMenuOpen(false);
          } else {
            createNewChat();
            setIsMenuOpen(false);
          }
        }}
        className="flex justify-center items-center w-full py-2 mt-6 sm:mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer shrink-0 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Conversations — only for logged in users */}
      {user && (
        <div className="flex items-center gap-2 p-2.5 sm:p-3 mt-3 sm:mt-4 border border-gray-400 dark:border-white/20 rounded-md shrink-0">
          <img src={assets.search_icon} className="w-4 not-dark:invert" />
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder="Search Conversations"
            className="text-xs placeholder:text-gray-400 outline-none bg-transparent w-full"
          />
        </div>
      )}

      {/* Recent Chats — only for logged in users */}
      {user && chats.length > 0 && (
        <p className="mt-3 sm:mt-4 text-sm shrink-0">Recent Chats</p>
      )}
      {user ? (
        <div className="flex-1 min-h-0 overflow-y-auto mt-2 sm:mt-3 text-sm space-y-2 sm:space-y-3">
          {chats
            .filter((chat) =>
              chat.messages[0]
                ? chat.messages[0]?.content
                    .toLowerCase()
                    .includes(search.toLowerCase())
                : chat.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((chat) => (
              <div
                onClick={() => {
                  navigate("/");
                  setSelectedChat(chat);
                  setIsMenuOpen(false);
                }}
                key={chat._id}
                className="p-2 px-3 sm:px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between items-center group active:scale-[0.98] transition-transform"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {chat.messages.length > 0
                      ? chat.messages[0].content.slice(0, 32)
                      : chat.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                    {moment(chat.updatedAt).fromNow()}
                  </p>
                </div>
                <img
                  onClick={(e) =>
                    toast.promise(deleteChat(e, chat._id), {
                      loading: "deleting...",
                    })
                  }
                  src={assets.bin_icon}
                  className="max-md:block hidden group-hover:block w-5 p-0.5 cursor-pointer not-dark:invert active:opacity-60 transition-opacity shrink-0 ml-2"
                  alt=""
                />
              </div>
            ))}
        </div>
      ) : (
        /* Guest: sign-in prompt in place of chat history */
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center mt-3 text-sm text-gray-400 dark:text-gray-500">
          <p className="text-center">Sign in to save your chat history</p>
          <button
            onClick={() => {
              navigate("/login");
              setIsMenuOpen(false);
            }}
            className="mt-3 px-4 py-1.5 text-xs text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] rounded-md cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Bottom section — shrink-0 to prevent being pushed off screen */}
      <div className="shrink-0 space-y-2 sm:space-y-3 mt-3 sm:mt-4">
        {/* Community Images */}
        <div
          onClick={() => {
            navigate("/community");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-2.5 sm:p-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <img src={assets.gallery_icon} className="w-4.5 not-dark:invert" />
          <p className="text-sm">Community Images</p>
        </div>

        {/* Credit Purchase Option */}
        <div
          onClick={() => {
            navigate("/credits");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-2.5 sm:p-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <img src={assets.diamond_icon} className="w-4.5 dark:invert" />
          <div className="flex flex-col text-sm">
            {user ? (
              <>
                <p>Credits: {user.credits}</p>
                <p className="text-xs text-gray-400">
                  Purchase credits to use RajGPT
                </p>
              </>
            ) : (
              <>
                <p>Credits: {guestCredits}</p>
                <p className="text-xs text-gray-400">
                  Sign in to get 20 credits more..
                </p>
              </>
            )}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 border border-gray-300 dark:border-white/15 rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <img src={assets.theme_icon} className="w-4 not-dark:invert" />
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex cursor-pointer">
            <input
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="checkbox"
              className="sr-only peer"
              checked={theme === "dark"}
            />
            <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
          </label>
        </div>

        {/* User Account */}
        <div
          onClick={() => {
            if (!user) {
              navigate("/login");
              setIsMenuOpen(false);
            }
          }}
          className="flex items-center gap-3 p-2.5 sm:p-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group"
        >
          <img src={assets.user_icon} className="w-7 rounded-full shrink-0" />
          <div className="flex flex-col flex-1 text-sm min-w-0">
            <p className="flex-1 text-sm dark:text-primary truncate">
              {user ? user.name : "Sign in to your account"}
            </p>
          </div>
          {user && (
            <img
              onClick={logout}
              src={assets.logout_icon}
              className="h-5 cursor-pointer max-md:block hidden not-dark:invert group-hover:block active:opacity-60 transition-opacity shrink-0"
            />
          )}
        </div>
      </div>

      {/* Close button for mobile */}
      <img
        src={assets.close_icon}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
        onClick={() => setIsMenuOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
