import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkMode } from "./utils/checkMode";

const BACKEND_URL = checkMode();
const signupSchema = z.object({
  username: z.string(),
  email: z.string().min(1, "Email is required").email("Invalid email adress"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });
  const navigate = useNavigate();

  const handleSignup = async (data: SignupFormInputs) => {
    const { username = "", email = "", password = "" } = data;
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        throw new Error("Signup failed");
      }

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 bg-zinc-900 text-white flex flex-col justify-between p-6 md:p-10">
        <div className="text-xl font-semibold flex items-center gap-2">
          ⌘ TaskTime
        </div>
        <div className="flex flex-col justify-center flex-grow space-y-10 mt-10">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold">Your team's time, mastered.</h2>
            <p className="mt-4 text-lg text-gray-300">
              TaskTime brings clarity to your workday with smart scheduling,
              seamless tracking, and powerful team coordination.
            </p>
          </div>

          <div className="max-w-md">
            <blockquote className="text-lg italic text-gray-200">
              "Ready to get started with TaskTime."
            </blockquote>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6 md:p-10">
        <form
          onSubmit={handleSubmit(handleSignup)}
          className="max-w-md w-full space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold">Create an account</h2>
            <p className="text-gray-500">
              Enter your details to create an account
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black-600">
              Username
            </label>
            <input
              type="username"
              placeholder="John Doe"
              {...register("username")}
              className="mt-1 block w-full border border-gray-300 p-2 rounded"
            />
            {errors.username && (
              <p className="text-red-600 text-sm">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black-600">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className="mt-1 block w-full border border-gray-300 p-2 rounded"
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-black-600">
                Password
              </label>
            </div>
            <input
              type="password"
              placeholder="******"
              {...register("password")}
              className="mt-1 block w-full border border-gray-300 p-2 rounded"
            />
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="terms"
              type="checkbox"
              {...register("terms", {
                required: "You must accept the terms and conditions",
              })}
              className="h-4 w-4  border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 underline">
                terms of service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 underline">
                privacy policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-600 text-sm">{errors.terms.message}</p>
          )}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-zinc-800 transition"
          >
            Sign up
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
