import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { RegisterCredentials } from "../types/auth";
import { Link } from "react-router-dom";

// Extend the RegisterCredentials interface to include the new fields
interface ExtendedRegisterCredentials extends RegisterCredentials {
  name: string;
  confirmPassword: string;
}

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExtendedRegisterCredentials>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  // Watch password field to compare with confirmPassword
  const password = watch("password");

  const onSubmit = async (data: ExtendedRegisterCredentials) => {
    try {
      // Only send the required fields to the backend
      const { name, email, password } = data;
      await registerUser({ name, email, password }).unwrap();
      navigate("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm relative"
      >
        <h2 className="text-2xl font-semibold mb-6 text-text">
          Create Account
        </h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 bg-red-500 text-white text-sm p-3 rounded-md shadow-lg"
          >
            Registration failed. Email may be in use.
          </motion.p>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-text text-sm mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                pattern: {
                  value: /^[A-Za-z\s]+$/i,
                  message: "Name must contain only letters and spaces",
                },
              })}
              className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-text text-sm mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                  message: "Invalid email format",
                },
              })}
              className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
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
                // pattern: {
                //   value:
                //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                //   message:
                //     "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
                // },
              })}
              className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label
              className="block text-text text-sm mb-1"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
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
          <Link to="/login" className="text-accent hover:text-green-600">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
