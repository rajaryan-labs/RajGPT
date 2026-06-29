import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

/**
 * ChatBox Component
 * Responsible for displaying the chat messages, handling user input (text/image prompts),
 * communicating with the backend to fetch AI responses, and auto-scrolling the chat view.
 * Supports guest mode — guests can chat without login (text only, in-memory).
 */
const ChatBox = () => {
  const containerRef = useRef(null);

  const {
    selectedChat,
    theme,
    user,
    setUser,
    axios,
    token,
    isGuest,
    guestMessages,
    sendGuestMessage,
    navigate,
  } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  /**
   * Handles the form submission to send a new message.
   * For guests: calls sendGuestMessage (no auth, no credits).
   * For authenticated users: updates the UI immediately with the user's prompt,
   * then makes an API request to get the AI response.
   * @param {Event} e - The form submission event
   */
  const onSubmit = async (e) => {
    try {
      e.preventDefault();

      if (!prompt.trim()) return;

      // Guest mode: use the guest endpoint
      if (isGuest) {
        setLoading(true);
        const promptCopy = prompt;
        setPrompt("");
        const result = await sendGuestMessage(promptCopy, mode, isPublished);
        if (!result) {
          setPrompt(promptCopy);
        }
        setLoading(false);
        return;
      }

      // Authenticated mode
      if (!user) return toast("Login to send message");

      setLoading(true);

      const promptCopy = prompt;
      setPrompt("");

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: prompt,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt,
          isPublished,
        },
        {
          headers: { Authorization: token },
        },
      );

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
        setMessages((prev) => [...prev, replyMessage]);

        // decrease credits
        if (mode === "image") {
          setUser((prev) => ({
            ...prev,
            credits: prev.credits - 2,
          }));
        } else {
          setUser((prev) => ({
            ...prev,
            credits: prev.credits - 1,
          }));
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  // Effect to load messages — from selectedChat for authenticated users, guestMessages for guests
  useEffect(() => {
    if (isGuest) {
      setMessages(guestMessages);
    } else if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat, guestMessages, isGuest]);

  // Effect to auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 px-2 pt-1 pb-2 sm:px-5 sm:pt-3 sm:pb-3 md:px-10 md:pt-5 md:pb-5 xl:px-30 max-md:pt-12 2xl:pr-40">
      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 min-h-0 mb-2 sm:mb-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full mb-2 sm:mb-4">
              <img src={assets.logo} className="w-11 h-11 sm:w-16 sm:h-16" alt="RajGPT Logo" />
              <div className="flex flex-col text-left">
                <span className="text-2xl sm:text-4xl font-bold dark:text-white text-black leading-tight">RajGPT</span>
                <span className="text-[10px] sm:text-sm font-semibold text-[#A456F7] dark:text-primary">Intelligent AI Assistant</span>
              </div>
            </div>
            <p className="mt-2 sm:mt-5 text-2xl sm:text-4xl md:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything.
            </p>
            {isGuest && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400 dark:text-gray-500 text-center px-4">
                You're chatting as a guest.{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-indigo-500 cursor-pointer hover:underline"
                >
                  Sign in
                </span>{" "}
                to save your chats.
              </p>
            )}
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {/* Three Dots Loading */}
        {loading && (
          <div className="loader flex items-center gap-1.5 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-2 text-sm mx-auto">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}
      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-2 pl-3 sm:p-4 sm:pl-6 mx-auto flex gap-2 sm:gap-4 items-center shrink-0"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm sm:text-base pl-1 sm:pl-3 pr-1 sm:pr-2 outline-none bg-transparent"
        >
          <option className="dark:bg-purple-900" value="text">
            Text
          </option>
          <option className="dark:bg-purple-900" value="image">
            Image
          </option>
        </select>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          className="flex-1 w-0 min-w-0 text-sm sm:text-base outline-none bg-transparent"
          type="text"
          placeholder="Enter Your Prompt Here.."
          required
        />
        <button disabled={loading} className="shrink-0 pr-1 sm:pr-2">
          <img
            className="w-6 sm:w-9 cursor-pointer"
            src={loading ? assets.stop_icon : assets.send_icon}
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
