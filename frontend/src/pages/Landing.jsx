import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/auth'
import { 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Globe, 
  ShieldCheck, 
  ListTodo,
  Play,
  Layers,
  Search,
  Sparkles
} from 'lucide-react'

export default function Landing() {
  const { token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)

  // Simulation loop for the live showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const agentSteps = [
    {
      title: '1. Planner Node',
      status: 'Analyzing Goal & Building Task Tree',
      detail: 'Goal: "Create a PRD for an eco-friendly ride-sharing app with carbon footprint tracking"',
      badge: 'Planning',
      color: 'border-blue-500 bg-blue-50/50 text-blue-700',
    },
    {
      title: '2. Researcher Node',
      status: 'Retrieving context & Querying web',
      detail: 'Found 4 documents on user travel patterns. Executing web queries for carbon calculators.',
      badge: 'Researching',
      color: 'border-amber-500 bg-amber-50/50 text-amber-700',
    },
    {
      title: '3. Analyzer Node',
      status: 'Verifying confidence & logic check',
      detail: 'Confidence rating: 94%. No contradictions found. Moving to production-ready formatting.',
      badge: 'Analyzing',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-700',
    },
    {
      title: '4. Generator Node',
      status: 'Running Guardrails & Formatting Output',
      detail: 'Generating complete PRD with Overview, User Stories, and Success Metrics.',
      badge: 'Generating',
      color: 'border-indigo-500 bg-indigo-50/50 text-indigo-700',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:opacity-95 transition-opacity">
            <BrainCircuit size={28} className="text-indigo-600" />
            <span className="tracking-tight text-slate-900">APMA</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">Live Simulation</a>
          </nav>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 flex items-center gap-1.5"
                >
                  Dashboard <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[400px] pointer-events-none opacity-40 blur-[120px] bg-gradient-to-r from-indigo-300 via-purple-200 to-sky-300 rounded-full" />
        
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700 mb-6">
            <Sparkles size={12} />
            <span>Introducing APMA v1.0 — Autonomous Product Manager Agent</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Supercharge Product Discovery <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
              with Autonomous AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            APMA reads your source documents, conducts deep web research, runs multi-stage planning, and drafts publication-ready PRDs, roadmaps, and briefs in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to={token ? "/dashboard" : "/register"}
              className="w-full sm:w-auto bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Start Building Free <ArrowRight size={16} />
            </Link>
            <a 
              href="#demo"
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 font-medium px-8 py-3.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={14} className="fill-slate-700 text-slate-700" /> Watch Live Demo
            </a>
          </div>
        </div>
      </section>

      {/* Live Simulation Showcase Section */}
      <section id="demo" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-400" />
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={12} className="text-slate-400" /> Agent Execution Loop
            </div>
            <div className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
              Live Demo
            </div>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Watch the Agent Think</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Unlike simple LLM wrappers, APMA builds an execution graph. It plans, searches, acts, checks guardrails, and refines. Click or wait to see the steps cycle.
                </p>
              </div>

              <div className="space-y-2">
                {agentSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      activeStep === idx 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm shadow-indigo-100/50' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${activeStep === idx ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {step.title}
                      </span>
                      {activeStep === idx && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 bg-slate-950 rounded-xl p-6 text-slate-200 font-mono text-xs flex flex-col justify-between shadow-inner h-[280px] md:h-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">Node Status: <strong className="text-indigo-400">{agentSteps[activeStep].badge}</strong></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                </div>
                
                <div className="space-y-3">
                  <p className="text-slate-400 flex items-start gap-1">
                    <span className="text-slate-600">&gt;</span> 
                    <span className="text-slate-100">{agentSteps[activeStep].status}</span>
                  </p>
                  <p className="text-indigo-300 leading-relaxed break-words">
                    {agentSteps[activeStep].detail}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-slate-500">
                <span>Task progress</span>
                <span>{((activeStep + 1) * 25)}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Everything You Need to Ship Products Faster
            </h2>
            <p className="text-slate-600">
              Built on a state-of-the-art agent architecture that avoids hallucinations by combining direct knowledge base lookup with real-time research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<ListTodo className="text-indigo-600" size={24} />}
              title="Autonomous Planning"
              desc="Breaks down complex instructions into a granular plan of sub-tasks, optimizing output coverage."
            />
            <FeatureCard 
              icon={<FileText className="text-indigo-600" size={24} />}
              title="Smart Document RAG"
              desc="Upload PDF, DOCX, or CSV files to automatically generate vectors, maintaining absolute context."
            />
            <FeatureCard 
              icon={<Globe className="text-indigo-600" size={24} />}
              title="Real-time Web Search"
              desc="Uses Tavily search to fetch the latest industry insights, benchmarks, and details dynamically."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-indigo-600" size={24} />}
              title="Strict Guardrails"
              desc="Runs automatic quality analysis and confidence checks before output delivery, ensuring premium quality."
            />
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              A Seamless Lifecycle
            </h2>
            <p className="text-slate-600">
              Transform goals into clear, executable development artifacts in four simple steps.
            </p>
          </div>

          <div className="relative border-l border-slate-200 ml-4 md:ml-0 md:border-l-0 md:grid md:grid-cols-4 md:gap-8">
            <StepItem 
              num="01" 
              title="Upload Knowledge" 
              desc="Drop in existing specs, analytics data, or requirements files." 
            />
            <StepItem 
              num="02" 
              title="Prompt Your Agent" 
              desc="State what you want to research, plan, or define in plain English." 
            />
            <StepItem 
              num="03" 
              title="Observe execution" 
              desc="Follow along in real-time as nodes complete planning and research loops." 
            />
            <StepItem 
              num="04" 
              title="Deploy Specs" 
              desc="Export polished PRDs, roadmaps, and briefs directly to your team." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <BrainCircuit size={20} className="text-indigo-600" />
            <span>APMA</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} APMA. All rights reserved. Built for modern product teams.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all group duration-300">
      <div className="h-12 w-12 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-slate-950 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepItem({ num, title, desc }) {
  return (
    <div className="relative pl-8 md:pl-0 md:text-center pb-8 md:pb-0">
      {/* Node circle */}
      <div className="absolute left-[-17px] top-0 md:static md:mx-auto h-8 w-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 shadow-sm mb-4">
        {num}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed max-w-[220px] md:mx-auto">{desc}</p>
    </div>
  )
}
