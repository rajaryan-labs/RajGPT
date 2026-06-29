import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";

/**
 * Credits Component
 * Displays available credit packages that users can purchase.
 * Integrates with Stripe for handling the payment process.
 * Shows a sign-in prompt for guest users.
 */
const Credits = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, axios, user, navigate } = useAppContext();

  /**
   * Fetches available credit plans from the server.
   */
  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("/api/credit/plan", {
        headers: { Authorization: token },
      });
      if (data.success) {
        setPlans(data.plans);
      } else {
        toast.error(data.message || "Failed to fetch plans.");
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  /**
   * Handles purchasing a specific plan.
   * Calls the backend to create a Stripe checkout session, then redirects the user to Stripe.
   * @param {string} planId - The ID of the plan to purchase
   */
  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post(
        "/api/credit/purchase",
        { planId },
        { headers: { Authorization: token } },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Something went wrong");
      }

      window.location.href = data.url;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Request failed";
      throw new Error(message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Loading />;

  // Guest user — prompt to sign in
  if (!user) {
    return (
      <div className="max-w-7xl h-full overflow-y-auto mx-auto px-4 sm:px-6 lg:px-8 py-12 max-md:pt-14 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Credit Plans
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Sign in to purchase credits and unlock image generation.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] rounded-md cursor-pointer hover:opacity-90 transition-opacity font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl h-full overflow-y-auto mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-md:pt-14">
      <h2 className="text-3xl font-semibold text-center mb-10 xl:mb-30 text-gray-800 dark:text-white">
        Credit Plans
      </h2>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6 w-full sm:min-w-[300px] sm:max-w-sm flex flex-col ${
              plan._id === "pro"
                ? "bg-purple-50 dark:bg-purple-900"
                : "bg-white dark:bg-transparent"
            }`}
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>

              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4">
                ${plan.price}
                <span> / {plan.credits} credits</span>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() =>
                toast.promise(purchasePlan(plan._id), {
                  loading: "Processing...",
                  success: "Redirecting to payment...",
                  error: (err) => err?.message || "Purchase failed",
                })
              }
              className="mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded transition-colors cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
