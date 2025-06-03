import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkMode } from "./utils/checkMode";

const BACKEND_URL = checkMode();

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email adress"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormInputs) => {
    console.log("Submitted Data", data);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
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
            <img
              src="/illustration.svg"
              alt="TaskTime dashboard"
              className="w-full h-auto "
            />
          </div>

          <div className="max-w-2xl">
            <blockquote className="text-lg italic text-gray-200">
              "TaskTime has completely changed the way our team stays on top of
              tasks and deadlines. The intuitive interface and timely reminders
              keep everyone aligned and accountable—our productivity has never
              been better."
            </blockquote>
            <p className="mt-4 text-sm text-gray-400">John Doe</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6 md:p-10">
        <form
          onSubmit={handleSubmit(handleLogin)}
          className="max-w-md w-full space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-500">
              Enter your credentials to sign in to your account
            </p>
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
              <a href="#" className="text-sm text-gray-500">
                Forgot password?
              </a>
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

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-zinc-800 transition"
          >
            Sign in
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a href="/signup" className="underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
