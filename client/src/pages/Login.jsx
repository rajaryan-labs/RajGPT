import React from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

/**
 * Login Component
 * Handles user authentication, both for logging in existing users and registering new ones.
 * Submits the form data to the backend and updates the global token state on success.
 * Includes a "Continue without signing in" option for guest access.
 */
const Login = () => {
  // State management for form view, name, email, and password
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { axios, setToken, navigate } = useAppContext();

  /**
   * Handles the form submission for login or registration.
   * Sends the appropriate request to the API based on the current `state`.
   * Redirects to home on success.
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = state === "login" ? "/api/user/login" : "/api/user/register";
    try {
      const { data } = await axios.post(url, { name, email, password });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
    >
      <p className="text-2xl font-medium m-auto">
        <span className="text-indigo-500">User</span>{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>
      {state === "register" && (
        <div className="w-full">
          <p>Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="text"
            required
          />
        </div>
      )}
      <div className="w-full ">
        <p>Email</p>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
          type="email"
          required
        />
      </div>
      <div className="w-full ">
        <p>Password</p>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
          type="password"
          required
        />
      </div>
      {state === "register" ? (
        <p>
          Already have account?{" "}
          <span
            onClick={() => setState("login")}
            className="text-indigo-500 cursor-pointer"
          >
            click here
          </span>
        </p>
      ) : (
        <p>
          Create an account?{" "}
          <span
            onClick={() => setState("register")}
            className="text-indigo-500 cursor-pointer"
          >
            click here
          </span>
        </p>
      )}
      <button
        type="submit"
        className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 active:scale-95 transition-all text-white w-full py-2 rounded-md cursor-pointer"
      >
        {state === "register" ? "Create Account" : "Login"}
      </button>

      {/* Continue without signing in */}
      <p
        onClick={() => navigate("/")}
        className="text-sm text-center w-full text-gray-400 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        Continue without signing in →
      </p>
    </form>
  );
};

export default Login;
