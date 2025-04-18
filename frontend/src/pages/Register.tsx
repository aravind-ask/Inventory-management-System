import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { RegisterCredentials } from "../types/auth";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCredentials>();
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      await registerUser(data).unwrap();
      navigate("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 text-text">
          Create Account
        </h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-4 text-sm text-center"
          >
            Registration failed. Email may be in use.
          </motion.p>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-text text-sm mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-text text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600 disabled:bg-green-300"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>
        <p className="mt-4 text-center text-text text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-secondary hover:underline">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
