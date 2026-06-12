export default function PRDViewer({ output, outputType }) {
  if (!output) return null

  if (outputType === 'prd') {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">{output.title}</h2>
          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">PRD</span>
        </div>

        <Section title="Overview" content={output.overview} />
        <Section title="Problem Statement" content={output.problem_statement} />
        <ListSection title="Goals" items={output.goals} />
        <ListSection title="User Stories" items={output.user_stories} />
        <ListSection title="Requirements" items={output.requirements} />
        <ListSection title="Success Metrics" items={output.success_metrics} />
        {output.risks?.length > 0 && <ListSection title="Risks" items={output.risks} />}
      </div>
    )
  }

  if (outputType === 'roadmap') {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-bold">{output.title}</h2>
        <Section title="Timeline" content={output.timeline} />
        <ListSection title="Milestones" items={output.milestones} />
        {output.phases?.map((phase, i) => (
          <div key={i}>
            <h4 className="font-semibold text-sm mb-2">{phase.name} — {phase.duration}</h4>
            <ul className="space-y-1">
              {phase.items?.map((item, j) => (
                <li key={j} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-blue-500">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  // brief
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-bold">{output.title}</h2>
      <Section title="Summary" content={output.summary} />
      <ListSection title="Key Points" items={output.key_points} />
      <ListSection title="Next Steps" items={output.next_steps} />
    </div>
  )
}

function Section({ title, content }) {
  return (
    <div>
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-1">{title}</h3>
      <p className="text-sm leading-relaxed">{content}</p>
    </div>
  )
}

function ListSection({ title, items }) {
  return (
    <div>
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items?.map((item, i) => (
          <li key={i} className="text-sm flex gap-2">
            <span className="text-blue-500 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}