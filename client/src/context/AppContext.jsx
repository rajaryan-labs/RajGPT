import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

/**
 * AppContextProvider component
 * Provides global state management for user authentication, chats, theme, and API token.
 * Supports guest mode — users can chat without logging in (messages stored in memory).
 */
export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Guest mode state
  const [guestMessages, setGuestMessages] = useState([]);
  const [guestCredits, setGuestCredits] = useState(
    localStorage.getItem("guestCredits") !== null
      ? parseInt(localStorage.getItem("guestCredits"))
      : 20
  );
  const isGuest = !user && !loadingUser;

  /**
   * Fetches user data from the server using the stored token.
   * Updates the `user` state on success or shows an error toast.
   */
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  /**
   * Creates a new chat session for the current user.
   * Navigates to the home page and refreshes the user's chat list upon success.
   */
  const createNewChat = async () => {
    try {
      if (!user) {
        // Guest: clear messages and navigate home
        clearGuestChat();
        navigate("/");
        return;
      }
      navigate("/");
      await axios.get("/api/chat/create", {
        headers: { Authorization: token },
      });
      await fetchUsersChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * Fetches all chats associated with the current user.
   * Auto-creates a new chat if the user currently has none.
   */
  const fetchUsersChats = async () => {
    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setChats(data.chats);
        // if the user has no chats, create one
        if (data.chats.length === 0) {
          await createNewChat();
          return fetchUsersChats();
        } else {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * Sends a text message as a guest (no authentication).
   * Messages are stored in memory and not persisted to the database.
   * @param {string} prompt - The user's message
   * @returns {object} - The AI response message object, or null on failure
   */
  const sendGuestMessage = async (prompt, mode = "text", isPublished = false) => {
    try {
      const creditCost = mode === "image" ? 2 : 1;
      
      if (guestCredits < creditCost) {
        toast("Sign in to get more credits", { icon: "💎" });
        navigate("/login");
        return null;
      }

      const userMessage = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
        isImage: false,
      };
      setGuestMessages((prev) => [...prev, userMessage]);

      const endpoint = mode === "image" ? "/api/guest/image" : "/api/guest/text";
      const { data } = await axios.post(endpoint, { prompt, isPublished });

      if (data.success) {
        const replyMessage =
          typeof data.message === "string"
            ? {
                role: "assistant",
                content: data.message,
                timestamp: Date.now(),
                isImage: false,
              }
            : data.message;
        
        setGuestMessages((prev) => [...prev, replyMessage]);
        
        // Decrement guest credits
        const newCredits = guestCredits - creditCost;
        setGuestCredits(newCredits);
        localStorage.setItem("guestCredits", newCredits.toString());
        
        return replyMessage;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  /**
   * Clears guest chat messages (acts as "new chat" for guests).
   */
  const clearGuestChat = () => {
    setGuestMessages([]);
  };

  // Effect to apply the selected theme to the document and save to local storage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Effect to fetch chats when a user logs in, or clear chats on logout
  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  // Effect to fetch user details when a token is set, or clear user on token removal
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);
  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUsersChats,
    token,
    setToken,
    axios,
    // Guest mode
    isGuest,
    guestMessages,
    guestCredits,
    sendGuestMessage,
    clearGuestChat,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
