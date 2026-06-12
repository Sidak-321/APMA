import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/axios'
import Navbar from '@/components/Navbar'
import { 
  Plus, 
  Folder, 
  FileText, 
  Zap, 
  Search, 
  FolderPlus, 
  X, 
  ChevronRight, 
  Layers,
  BarChart3,
  BookOpen
} from 'lucide-react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await api.post('/projects', { name, description })
      setProjects((prev) => [res.data, ...prev])
      setShowModal(false)
      setName('')
      setDescription('')
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  // Derive dynamic stats from the projects list
  const totalProjects = projects.length
  const totalDocs = projects.reduce((acc, curr) => acc + (curr._count?.documents || 0), 0)
  const totalRuns = projects.reduce((acc, curr) => acc + (curr._count?.agentRuns || 0), 0)

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    const term = searchQuery.toLowerCase()
    return (
      project.name.toLowerCase().includes(term) ||
      (project.description && project.description.toLowerCase().includes(term))
    )
  })

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Workspace</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Manage your projects, upload reference documentation, and trigger autonomous agent cycles.
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-100 shrink-0"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* Stats Summary Cards */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatCard 
              icon={<Layers className="text-indigo-600" size={20} />}
              label="Total Projects"
              value={totalProjects}
              color="bg-indigo-50 border-indigo-100"
            />
            <StatCard 
              icon={<BookOpen className="text-emerald-600" size={20} />}
              label="Documents Processed"
              value={totalDocs}
              color="bg-emerald-50 border-emerald-100"
            />
            <StatCard 
              icon={<BarChart3 className="text-purple-600" size={20} />}
              label="Agent Run Executions"
              value={totalRuns}
              color="bg-purple-50 border-purple-100"
            />
          </div>
        )}

        {/* Search & Listing Filters */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 mb-8 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search projects by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Main List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm">
            <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <FolderPlus size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {searchQuery ? 'No matching projects' : 'No projects configured'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery 
                ? "We couldn't find any projects matching your search term. Try another query." 
                : "Get started by building your first workspace. Upload specs and generate artifacts."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              // Get initials for project icon placeholder
              const initials = project.name ? project.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PJ'
              
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-white border border-slate-200/85 hover:border-indigo-200 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md hover:shadow-indigo-50/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[200px]"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {project.name}
                        </h3>
                        <span className="text-[10px] text-slate-400">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {project.description ? (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No description provided.</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                    <div className="flex gap-4 text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText size={14} className="text-slate-400" />
                        {project._count?.documents ?? 0} docs
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={14} className="text-slate-400" />
                        {project._count?.agentRuns ?? 0} runs
                      </span>
                    </div>
                    <div className="text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 text-xs font-bold">
                      Open <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create Project Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowModal(false)}
            />
            
            {/* Modal Dialog */}
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all p-6 md:p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-lg font-bold text-slate-900">Create New Project</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Project Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Driver Onboarding Flow"
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    required
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly summarize what goals, documents, and output types this project handles."
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 min-h-[80px]"
                    maxLength={150}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {creating ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm h-[200px] flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-slate-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-5/6" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
        <div className="flex gap-4">
          <div className="h-3 bg-slate-200 rounded w-12" />
          <div className="h-3 bg-slate-200 rounded w-12" />
        </div>
        <div className="h-3 bg-slate-200 rounded w-10" />
      </div>
    </div>
  )
}