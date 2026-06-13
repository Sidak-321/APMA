import { useState, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

export function useSSE() {
  const [events, setEvents] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [finalOutput, setFinalOutput] = useState(null)
  const readerRef = useRef(null)

  const startStream = useCallback(async (projectId, goal, outputType) => {
    setEvents([])
    setFinalOutput(null)
    setIsStreaming(true)

    const token = localStorage.getItem('accessToken')

    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal, output_type: outputType }),
      })

      const reader = response.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              setEvents((prev) => [...prev, event])

              if (event.type === 'complete') {
                setFinalOutput(event.content)
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error('SSE error:', err)
    } finally {
      setIsStreaming(false)
    }
  }, [])

  return { events, isStreaming, finalOutput, startStream }
}