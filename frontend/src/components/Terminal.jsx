import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'

export default function Terminal({ sandboxId }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const [connected, setConnected] = useState(true)
  const currentLine = useRef('')

  const prompt = useCallback((term) => {
    term.write('\r\n\x1b[36mdevpilot\x1b[0m:\x1b[34m~/workspace\x1b[0m$ ')
  }, [])

  const executeCommand = useCallback(async (command, term) => {
    const trimmed = command.trim()
    if (!trimmed) {
      prompt(term)
      return
    }

    if (trimmed === 'clear') {
      term.clear()
      prompt(term)
      return
    }

    try {
      const res = await fetch('/run-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed })
      })

      const data = await res.json()
      if (data.stdout) {
        const lines = data.stdout.split('\n')
        lines.forEach(l => term.writeln(`\r\n${l}`))
      }
      if (data.stderr) {
        const lines = data.stderr.split('\n')
        lines.forEach(l => term.writeln(`\r\n\x1b[31m${l}\x1b[0m`))
      }
      if (!data.stdout && !data.stderr && data.exitCode === 0) {
        term.writeln('\r\n\x1b[32mCommand completed with exit code 0\x1b[0m')
      }
    } catch (err) {
      term.writeln(`\r\n\x1b[31mError executing command: ${err.message}\x1b[0m`)
    }

    prompt(term)
  }, [prompt])

  const initTerminal = useCallback(() => {
    if (!containerRef.current || termRef.current) return

    const term = new XTerm({
      theme: {
        background: '#070b14',
        foreground: '#e2e8f0',
        cursor: '#22d3ee',
        cursorAccent: '#070b14',
        selectionBackground: 'rgba(34,211,238,0.2)',
        black: '#1e2d45',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#334155',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c4b5fd',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.writeln('\x1b[36m╔══════════════════════════════════════════════════╗\x1b[0m')
    term.writeln('\x1b[36m║   \x1b[1mDevPilot Local Workspace Console (Sentinel)\x1b[0m\x1b[36m    ║\x1b[0m')
    term.writeln('\x1b[36m╚══════════════════════════════════════════════════╝\x1b[0m')
    term.writeln('\x1b[32m✓ Connected to target repository workspace\x1b[0m')
    term.writeln('\x1b[90mCommands run inside sandbox/template (e.g. npm test, git status, ls)\x1b[0m')
    prompt(term)

    term.onData((e) => {
      // Enter
      if (e === '\r') {
        const cmd = currentLine.current
        currentLine.current = ''
        executeCommand(cmd, term)
      }
      // Backspace
      else if (e === '\u007F') {
        if (currentLine.current.length > 0) {
          currentLine.current = currentLine.current.slice(0, -1)
          term.write('\b \b')
        }
      }
      // Ctrl+C
      else if (e === '\u0003') {
        currentLine.current = ''
        term.writeln('^C')
        prompt(term)
      }
      // Standard printable characters
      else if (e >= ' ' || e === '\t') {
        currentLine.current += e
        term.write(e)
      }
    })

    return term
  }, [prompt, executeCommand])

  useEffect(() => {
    const term = initTerminal()

    const handleResize = () => fitAddonRef.current?.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      term?.dispose()
      termRef.current = null
    }
  }, [initTerminal])

  return (
    <div className="flex flex-col h-full" style={{ background: '#070b14' }}>
      {/* Terminal toolbar */}
      <div className="flex items-center justify-between px-3 shrink-0"
        style={{ height: '32px', background: '#0d1424', borderBottom: '1px solid #1e2d45' }}>
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Terminal</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">/workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ background: connected ? '#10b981' : '#ef4444', boxShadow: `0 0 6px ${connected ? '#10b981' : '#ef4444'}` }} />
            <span className="text-xs" style={{ color: '#475569' }}>
              {connected ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* xterm container */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  )
}
