"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"
import toastService from "@/services/toastService"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await login(formData)
      navigate("/home")
    } catch (error) {
      console.error("Error logging in:", error)
      toastService.error("Failed to log in. Please check your credentials.")
    }
  }

  const handleGoogleLogin = () => {
    console.log("[v0] Google login clicked")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/black_logo_transparent.png"
              alt="Haivens Logo"
              width={150}
              height={50}
              className="flex-shrink-0"
            />
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg 
                           text-gray-900 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-medium transition-colors"
                  style={{ color: "var(--brand-green)" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--brand-dark_green)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--brand-green)")}
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg 
                           text-gray-900 placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 font-medium rounded-full text-white transition-opacity brand-gradient-bg hover:opacity-90"
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="flex items-center">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="px-3 text-xs uppercase text-gray-500">Or continue with</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-11 flex items-center justify-center gap-2
                       border border-gray-300 rounded-lg bg-white
                       text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={() => navigate("/register-flow")}
              className="font-medium transition-colors"
              style={{ color: "var(--brand-green)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--brand-dark_green)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--brand-green)")}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative Image */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[var(--brand-green)] via-[var(--brand-dark_green)] to-[#067A68]">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-lg space-y-6 text-center">
            <div className="mx-auto w-full max-w-md aspect-square relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
              <img
                src="/landingPage/Untitled design (27).png"
                alt="Wellness Journey"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">Your journey to wellness starts here</h2>
              <p className="text-lg leading-relaxed" style={{ color: "#D9F5F1" }}>
                Join thousands of users on their path to better mental health and personal growth
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm" style={{ color: "#C4EDE8" }}>Active Users</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.9</div>
                <div className="text-sm" style={{ color: "#C4EDE8" }}>Rating</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-sm" style={{ color: "#C4EDE8" }}>Resources</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}