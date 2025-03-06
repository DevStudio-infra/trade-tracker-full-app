"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      toast.success(
        `Thank you for subscribing! You are subscriber #${data.subscriberNumber}. We're excited to have you join us!`
      )
      setEmail("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto space-y-6"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500 mb-4">
            AI Trading Agent
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-violet-500 mx-auto rounded-full" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8"
        >
          Harness the power of advanced artificial intelligence to revolutionize your trading strategy.
          Our AI agent analyzes market patterns, predicts trends, and executes trades with unprecedented precision.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full sm:w-96 px-6 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Join Waitlist"
            )}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-gray-400"
        >
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">AI-Powered Analysis</h3>
            <p>Advanced algorithms analyzing market data in real-time</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Smart Execution</h3>
            <p>Automated trading with precision timing and risk management</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">24/7 Monitoring</h3>
            <p>Continuous market surveillance and opportunity detection</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
