import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/axios'
import useAuthStore from '@/store/auth'
import { BrainCircuit, Loader2, Lock, Mail, ArrowRight, ShieldCheck, Cpu } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      })
      setAuth(meRes.data, res.data.accessToken, res.data.refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Left Column - Hero/Info Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Abstract background decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="z-10 flex items-center gap-2 font-bold text-xl">
          <BrainCircuit size={28} className="text-indigo-400" />
          <span className="tracking-tight text-white">APMA</span>
        </div>

        <div className="z-10 space-y-8 my-auto">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Deploy your product discovery agent.
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Cpu className="text-indigo-300" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Autonomous Task Synthesis</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Plans are generated, refined, and validated via self-correcting agent chains.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck className="text-indigo-300" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Deterministic Guardrails</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Strict schema matching and checks prevent hallucinations in final PRD drafts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 border-t border-white/10 pt-6 text-xs text-slate-400">
          APMA version 1.0.0. Autonomous specifications for agile teams.
        </div>
      </div>

      {/* Right Column - Centered Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 md:p-10">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <BrainCircuit size={28} className="text-indigo-600 animate-pulse" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">APMA</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to APMA</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3.5 mb-5 flex items-start gap-2">
              <span className="font-bold shrink-0 mt-0.5">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-100"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}