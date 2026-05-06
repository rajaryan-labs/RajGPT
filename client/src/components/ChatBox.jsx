import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

/**
 * ChatBox Component
 * Responsible for displaying the chat messages, handling user input (text/image prompts),
 * communicating with the backend to fetch AI responses, and auto-scrolling the chat view.
 */
const ChatBox = () => {
  const containerRef = useRef(null);

  const { selectedChat, theme, user, setUser, axios, token } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  /**
   * Handles the form submission to send a new message.
   * Updates the UI immediately with the user's prompt, then makes an API request to get the AI response.
   * Handles both text and image modes and updates credits accordingly.
   * @param {Event} e - The form submission event
   */
  const onSubmit = async (e) => {
    try {
      e.preventDefault();

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

  // Effect to load messages from the currently selected chat
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

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
    <div className="flex-1 flex flex-col justify-between m-2 sm:m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40 pb-[env(safe-area-inset-bottom)]">
      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 mb-3 sm:mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {/* Three Dots Loading */}
        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto">
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
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-2 pl-3 sm:p-3 sm:pl-4 mx-auto flex gap-2 sm:gap-4 items-center shrink-0"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-xs sm:text-sm pl-1 sm:pl-3 pr-1 sm:pr-2 outline-none"
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
          className="flex-1 w-0 min-w-0 text-xs sm:text-sm outline-none"
          type="text"
          placeholder="Enter Your Prompt Here.."
          required
        />
        <button disabled={loading} className="shrink-0">
          <img
            className="w-6 sm:w-8 cursor-pointer"
            src={loading ? assets.stop_icon : assets.send_icon}
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
