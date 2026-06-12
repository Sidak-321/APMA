import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '@/lib/axios'
import useAuthStore from '@/store/auth'
import { BrainCircuit, Loader2, ArrowRight, ShieldCheck, MailOpen } from 'lucide-react'

export default function VerifyOtp() {
  const { state } = useLocation()
  const email = state?.email || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, code })
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      })
      setAuth(meRes.data, res.data.accessToken, res.data.refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
            <MailOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Check your email</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs">
            We sent a 6-digit verification code to <strong className="text-slate-800 font-semibold">{email || 'your email'}</strong>.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3.5 mb-6 flex items-start gap-2">
            <span className="font-bold shrink-0 mt-0.5">⚠️</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-3">
              Enter 6-Digit Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only allow digits
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl py-3 text-center text-2xl font-extrabold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-300"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-100"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Login</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">
            Didn't receive the email? Check your spam folder or contact support if the problem persists.
          </p>
        </div>
      </div>
    </div>
  )
}