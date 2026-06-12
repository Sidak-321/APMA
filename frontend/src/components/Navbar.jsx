import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/auth'
import { BrainCircuit, LogOut } from 'lucide-react'

export default function Navbar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-600">
        <BrainCircuit size={24} />
        APMA
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </nav>
  )
}