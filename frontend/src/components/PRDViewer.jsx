import { useState } from 'react'
import { Copy, Check, Download, Printer, FileText } from 'lucide-react'

export default function PRDViewer({ output, outputType }) {
  const [copied, setCopied] = useState(false)

  if (!output) return null

  // Helper to generate clean Markdown content
  function generateMarkdown() {
    if (outputType === 'prd') {
      return `# ${output.title || 'Product Requirement Document'}

## Overview
${output.overview || ''}

## Problem Statement
${output.problem_statement || ''}

## Goals
${output.goals?.map((g) => `- ${g}`).join('\n') || ''}

## User Stories
${output.user_stories?.map((u) => `- ${u}`).join('\n') || ''}

## Requirements
${output.requirements?.map((r) => `- ${r}`).join('\n') || ''}

## Success Metrics
${output.success_metrics?.map((s) => `- ${s}`).join('\n') || ''}

${output.risks?.length > 0 ? `## Risks\n${output.risks.map((rk) => `- ${rk}`).join('\n')}` : ''}
`
    }

    if (outputType === 'roadmap') {
      return `# ${output.title || 'Product Roadmap'}

## Timeline
${output.timeline || ''}

## Milestones
${output.milestones?.map((m) => `- ${m}`).join('\n') || ''}

## Phases
${output.phases?.map((p) => `### ${p.name} (${p.duration})\n${p.items?.map((it) => `- ${it}`).join('\n') || ''}`).join('\n\n') || ''}
`
    }

    // brief
    return `# ${output.title || 'Product Brief'}

## Summary
${output.summary || ''}

## Key Points
${output.key_points?.map((k) => `- ${k}`).join('\n') || ''}

## Next Steps
${output.next_steps?.map((n) => `- ${n}`).join('\n') || ''}
`
  }

  // Helper to generate clean HTML for Printing
  function generateHTML() {
    if (outputType === 'prd') {
      return `
        <h1>${output.title || 'Product Requirement Document'}</h1>
        <h2>Overview</h2>
        <p>${output.overview || ''}</p>
        <h2>Problem Statement</h2>
        <p>${output.problem_statement || ''}</p>
        <h2>Goals</h2>
        <ul>${output.goals?.map((g) => `<li>${g}</li>`).join('') || ''}</ul>
        <h2>User Stories</h2>
        <ul>${output.user_stories?.map((u) => `<li>${u}</li>`).join('') || ''}</ul>
        <h2>Requirements</h2>
        <ul>${output.requirements?.map((r) => `<li>${r}</li>`).join('') || ''}</ul>
        <h2>Success Metrics</h2>
        <ul>${output.success_metrics?.map((s) => `<li>${s}</li>`).join('') || ''}</ul>
        ${output.risks?.length > 0 ? `<h2>Risks</h2><ul>${output.risks.map((rk) => `<li>${rk}</li>`).join('')}</ul>` : ''}
      `
    }

    if (outputType === 'roadmap') {
      return `
        <h1>${output.title || 'Product Roadmap'}</h1>
        <h2>Timeline</h2>
        <p>${output.timeline || ''}</p>
        <h2>Milestones</h2>
        <ul>${output.milestones?.map((m) => `<li>${m}</li>`).join('') || ''}</ul>
        <h2>Phases</h2>
        ${output.phases?.map((p) => `
          <h3>${p.name} — ${p.duration}</h3>
          <ul>${p.items?.map((it) => `<li>${it}</li>`).join('') || ''}</ul>
        `).join('') || ''}
      `
    }

    // brief
    return `
      <h1>${output.title || 'Product Brief'}</h1>
      <h2>Summary</h2>
      <p>${output.summary || ''}</p>
      <h2>Key Points</h2>
      <ul>${output.key_points?.map((k) => `<li>${k}</li>`).join('') || ''}</ul>
      <h2>Next Steps</h2>
      <ul>${output.next_steps?.map((n) => `<li>${n}</li>`).join('') || ''}</ul>
    `
  }

  // Action: Copy markdown to clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generateMarkdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Action: Download Markdown file
  function handleDownloadMarkdown() {
    const markdown = generateMarkdown()
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${output.title?.toLowerCase().replace(/\s+/g, '_') || 'artifact'}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Action: Print / Save to PDF
  function handlePrintPDF() {
    const printWindow = window.open('', '_blank')
    const htmlContent = `
      <html>
        <head>
          <title>${output.title || 'Product Spec'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              line-height: 1.6;
              color: #1e293b;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 24px;
            }
            h1 {
              font-size: 28px;
              color: #0f172a;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            h2 {
              font-size: 18px;
              color: #4f46e5;
              margin-top: 32px;
              margin-bottom: 12px;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            h3 {
              font-size: 15px;
              color: #1e293b;
              margin-top: 24px;
              margin-bottom: 8px;
            }
            p {
              margin-bottom: 16px;
              font-size: 14px;
            }
            ul {
              margin-bottom: 24px;
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
              font-size: 14px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          ${generateHTML()}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Header bar with controls */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {output.title || 'Generated Specification'}
          </h2>
          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
            {outputType}
          </span>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            title="Copy Markdown to Clipboard"
            className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white shadow-sm"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            title="Download as Markdown file"
            className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white shadow-sm"
          >
            <Download size={14} />
            <span>Markdown</span>
          </button>

          <button
            onClick={handlePrintPDF}
            title="Print or Save as PDF"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Printer size={14} />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Render Document Content */}
      <div className="p-6 md:p-8 space-y-6">
        {outputType === 'prd' && (
          <>
            <Section title="Overview" content={output.overview} />
            <Section title="Problem Statement" content={output.problem_statement} />
            <ListSection title="Goals" items={output.goals} />
            <ListSection title="User Stories" items={output.user_stories} />
            <ListSection title="Requirements" items={output.requirements} />
            <ListSection title="Success Metrics" items={output.success_metrics} />
            {output.risks?.length > 0 && <ListSection title="Risks" items={output.risks} />}
          </>
        )}

        {outputType === 'roadmap' && (
          <>
            <Section title="Timeline" content={output.timeline} />
            <ListSection title="Milestones" items={output.milestones} />
            {output.phases?.map((phase, i) => (
              <div key={i} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                <h4 className="font-bold text-sm text-slate-900 mb-2.5">{phase.name} — {phase.duration}</h4>
                <ul className="space-y-2">
                  {phase.items?.map((item, j) => (
                    <li key={j} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-indigo-500 shrink-0">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {outputType === 'brief' && (
          <>
            <Section title="Summary" content={output.summary} />
            <ListSection title="Key Points" items={output.key_points} />
            <ListSection title="Next Steps" items={output.next_steps} />
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, content }) {
  return (
    <div>
      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-700">{content}</p>
    </div>
  )
}

function ListSection({ title, items }) {
  return (
    <div>
      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">{title}</h3>
      <ul className="space-y-2">
        {items?.map((item, i) => (
          <li key={i} className="text-sm flex gap-2 text-slate-700">
            <span className="text-indigo-500 shrink-0 font-extrabold">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}