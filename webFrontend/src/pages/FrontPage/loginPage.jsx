"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"
import toastService from "@/services/toastService"
import { getDemoLoginPayload } from "@/config/demoAccess"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [demoLoading, setDemoLoading] = useState(false)

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

  const handleDemoAccess = async () => {
    setDemoLoading(true)
    try {
      await login(getDemoLoginPayload())
      navigate("/home")
    } catch {
      // authProvider already surfaces login errors
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-on-light-bg.svg"
              alt="App logo"
              width={150}
              height={50}
              className="flex-shrink-0"
            />
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wider text-gray-500">Demo preview</p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to explore</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Use demo access for a seeded account, or enter any test credentials your environment provides. This is a
              mock login.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleDemoAccess}
            disabled={demoLoading}
            className="w-full min-h-[3.5rem] text-lg font-semibold rounded-xl text-white transition-opacity brand-gradient-bg hover:opacity-90 disabled:opacity-60"
          >
            {demoLoading ? "Signing in…" : "DEMO ACCESS"}
          </Button>

          <div className="relative">
            <div className="flex items-center">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="px-3 text-xs uppercase text-gray-500">Or sign in with email</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>
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

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={() =>
                toastService.info("User creation is not available for this demo.")
              }
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

      {/* Right Side — solid color panel + mockup copy (no stock imagery) */}
      <div className="hidden lg:flex flex-1 relative min-h-screen bg-gradient-to-br from-teal-700 via-[var(--brand-green)] to-indigo-900">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.12)_0%,transparent_50%,rgba(15,23,42,0.35)_100%)]" />
        <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-md space-y-8">
            <div className="rounded-3xl border border-white/25 bg-white/10 backdrop-blur-md shadow-2xl p-10 min-h-[220px] flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">Mockup panel</p>
              <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
                Lorem ipsum dolor sit amet—placeholder headline for layout review.
              </h2>
              <p className="text-sm leading-relaxed text-white/85">
                Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore. Numbers and claims here are
                fictional; they exist only to balance the column next to the form.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 text-center text-sm">
              <div className="rounded-2xl bg-white/10 border border-white/15 py-4 px-2">
                <div className="text-2xl font-bold tabular-nums">12</div>
                <div className="text-white/70 mt-1">Mock screens</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 py-4 px-2">
                <div className="text-2xl font-bold tabular-nums">0</div>
                <div className="text-white/70 mt-1">Real users</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 py-4 px-2">
                <div className="text-2xl font-bold tabular-nums">∞</div>
                <div className="text-white/70 mt-1">Coffee refills</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}