"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import { isFirebaseEnabled } from "@/lib/firebase";
import { LogIn, UserPlus, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { PublicOnlyRoute } from "@/components/AuthGuard";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/templates");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        const registered = await authService.register(email, password);
        setSuccess("Account created successfully!");
        setTimeout(() => {
          if (registered.role === "admin") {
            router.push("/admin/templates");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        const loggedIn = await authService.login(email, password);
        if (loggedIn.role === "admin") {
          router.push("/admin/templates");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#f97316] selection:text-white font-sans text-slate-800">
      {/* Background Decor Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#f97316]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#f97316]/3 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2.5">
          <img 
            src="https://flowbee.io/images/logo.png" 
            alt="flowbee logo" 
            className="h-6 w-auto object-contain shrink-0" 
          />
          <span className="text-2xl font-black tracking-tight text-slate-900 lowercase">
            flowbee
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Or{" "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="font-bold text-[#f97316] hover:text-[#ea580c] transition underline underline-offset-4 cursor-pointer"
          >
            {isRegister ? "sign in to your existing account" : "register a new account"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white border border-slate-200/60 py-8 px-6 shadow-sm rounded-3xl sm:px-10">
          {!isFirebaseEnabled && (
            <div className="mb-6 bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex gap-3">
              <ShieldAlert className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 leading-relaxed font-semibold text-left">
                <span className="font-bold block text-[#f97316] mb-0.5">Offline Sandbox Mode Active</span>
                Firebase API keys are not configured. You can log in using any email and a password of at least 6 characters. Data will be saved in your browser's local storage.
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs font-bold text-red-650 leading-relaxed text-left">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs font-bold text-emerald-650 leading-relaxed text-left">
              {success}
            </div>
          )}

          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/40 transition text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-3 pr-10 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/40 transition text-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-white bg-[#f97316] hover:bg-[#ea580c] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
                ) : isRegister ? (
                  <>
                    <UserPlus className="h-4 w-4" /> Register
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Sign In
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicOnlyRoute(LoginPage);
