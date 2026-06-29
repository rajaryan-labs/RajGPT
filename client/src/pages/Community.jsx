import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

/**
 * Community Component
 * Displays a gallery of images published by the community.
 * Fetches the public images from the server and renders them in a grid.
 */
const Community = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, user, token } = useAppContext();

  /**
   * Fetches published images from the backend API.
   * Updates the images state and sets loading to false when done.
   */
  const fetchImages = async () => {
    try {
      const { data } = await axios.get("/api/user/published-images");
      if (data.success) {
        setImages(data.images);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (chatId, messageId) => {
    try {
      const { data } = await axios.post(
        "/api/user/unpublish-image",
        { chatId, messageId },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        toast.success("Image removed from community");
        setImages((prev) => prev.filter((img) => img.messageId !== messageId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch images once the component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-4 sm:p-6 max-md:pt-14 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-purple-100">
        Community Images
      </h2>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((item, index) => (
            <div
              key={index}
              className="relative group block rounded-lg overflow-hidden border border-gray-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                />
              </a>

              <p className="absolute bottom-0 right-0 text-xs bg-black/50 backdrop-blur text-white px-4 py-1 rounded-tl-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                Created by {item.userName}
              </p>

              {user && user._id === item.userId && (
                <button
                  onClick={() => handleDelete(item.chatId, item.messageId)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-red-600 z-10"
                  title="Remove Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-purple-200 mt-10">
          No images Available.
        </p>
      )}
    </div>
  );
};

export default Community;
