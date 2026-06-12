import { CheckCircle, Circle, Loader, AlertCircle } from 'lucide-react'

const NODE_LABELS = {
  planner: 'Planning sub-tasks',
  researcher: 'Researching documents + web',
  analyzer: 'Analyzing confidence',
  generator: 'Generating output',
  graph: 'Agent',
}

const NODE_ORDER = ['planner', 'researcher', 'analyzer', 'generator']

function NodeStatus({ node, events }) {
  const completed = events.find((e) => e.type === 'node_complete' && e.node === node)
  const started = events.find((e) => e.type === 'start')
  const isStreaming = !completed && started
  const isPending = !started

  return (
    <div className="flex items-center gap-3 py-2">
      {completed ? (
        <CheckCircle size={20} className="text-green-500 shrink-0" />
      ) : isStreaming ? (
        <Loader size={20} className="text-blue-500 animate-spin shrink-0" />
      ) : (
        <Circle size={20} className="text-muted-foreground shrink-0" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>
          {NODE_LABELS[node]}
        </p>
        {completed && node === 'analyzer' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Confidence: {(completed.content.confidence_score * 100).toFixed(0)}%
          </p>
        )}
        {completed && node === 'planner' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {completed.content.sub_tasks?.length} sub-tasks identified
          </p>
        )}
        {completed && node === 'researcher' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {completed.content.research_count} topics researched
          </p>
        )}
        {completed && node === 'generator' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Guardrails: {completed.content.guardrails_passed ? '✅ passed' : '❌ failed'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function SSEViewer({ events, isStreaming }) {
  const error = events.find((e) => e.type === 'error')

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        {isStreaming && <Loader size={16} className="text-blue-500 animate-spin" />}
        Agent Progress
      </h3>

      {error ? (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error.content}
        </div>
      ) : (
        <div className="divide-y">
          {NODE_ORDER.map((node) => (
            <NodeStatus key={node} node={node} events={events} />
          ))}
        </div>
      )}
    </div>
  )
}