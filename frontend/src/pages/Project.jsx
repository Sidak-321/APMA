import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/lib/axios'
import Navbar from '@/components/Navbar'
import SSEViewer from '@/components/SSEViewer'
import PRDViewer from '@/components/PRDViewer'
import { useSSE } from '@/hooks/useSSE'
import { Upload, FileText, CheckCircle, Clock, XCircle, Zap } from 'lucide-react'

const STATUS_ICON = {
  ready: <CheckCircle size={14} className="text-green-500" />,
  pending: <Clock size={14} className="text-yellow-500" />,
  failed: <XCircle size={14} className="text-red-500" />,
}

export default function Project() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [goal, setGoal] = useState('')
  const [outputType, setOutputType] = useState('prd')
  const fileRef = useRef()
  const { events, isStreaming, finalOutput, startStream } = useSSE()

  useEffect(() => {
    fetchProject()
    fetchDocuments()
  }, [id])

  // Poll documents until all are ready
  useEffect(() => {
    const pending = documents.some((d) => d.status === 'pending')
    if (!pending) return
    const interval = setInterval(fetchDocuments, 5000)
    return () => clearInterval(interval)
  }, [documents])

  async function fetchProject() {
    const res = await api.get(`/projects/${id}`)
    setProject(res.data)
  }

  async function fetchDocuments() {
    const res = await api.get(`/projects/${id}/documents`)
    setDocuments(res.data)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await api.post(`/projects/${id}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocuments((prev) => [res.data, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  async function handleRunAgent(e) {
    e.preventDefault()
    if (!goal.trim()) return
    startStream(id, goal, outputType)
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">{project?.name}</h1>
        {project?.description && (
          <p className="text-muted-foreground text-sm mb-6">{project.description}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Documents + Run form */}
          <div className="lg:col-span-1 space-y-4">
            {/* Upload */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <FileText size={16} /> Documents
              </h2>

              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload size={20} className="mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Click to upload PDF, DOCX, CSV'}
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.csv"
                onChange={handleUpload}
                className="hidden"
              />

              <div className="mt-3 space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 text-sm">
                    {STATUS_ICON[doc.status] || STATUS_ICON.pending}
                    <span className="truncate flex-1">{doc.filename}</span>
                    {doc.status === 'ready' && (
                      <span className="text-xs text-muted-foreground">{doc.chunkCount} chunks</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Run agent form */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Zap size={16} /> Run Agent
              </h2>
              <form onSubmit={handleRunAgent} className="space-y-3">
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe what you want to build or research..."
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  required
                />
                <select
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="prd">PRD</option>
                  <option value="roadmap">Roadmap</option>
                  <option value="brief">Brief</option>
                </select>
                <button
                  type="submit"
                  disabled={isStreaming}
                  className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isStreaming ? (
                    <>
                      <span className="animate-spin">⚡</span> Running...
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Run Agent
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right — SSE viewer + PRD output */}
          <div className="lg:col-span-2 space-y-4">
            {(events.length > 0 || isStreaming) && (
              <SSEViewer events={events} isStreaming={isStreaming} />
            )}
            {finalOutput && (
              <PRDViewer output={finalOutput.output_json} outputType={outputType} />
            )}
            {!events.length && !isStreaming && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Zap size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">
                  Upload documents and run the agent to generate a PRD, roadmap, or brief.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}