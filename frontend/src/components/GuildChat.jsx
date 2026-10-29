import { useState, useRef, useEffect, useCallback } from 'react';

const GUILD_PHASES = [
  { id: 'shogun_council', label: "Shogun", title: "Shogun's Council (Planning)", icon: '⚔️' },
  { id: 'samurai_forge', label: 'Samurai', title: 'Samurai Forge (Building)', icon: '🔨' },
  { id: 'sentinel_dojo', label: 'Sentinel', title: 'Sentinel Dojo (Testing)', icon: '🛡️' },
  { id: 'shadow_council', label: 'Shadow', title: 'Shadow Council (Security)', icon: '🌑' },
  { id: 'human_oversight', label: 'Sovereign', title: 'Human Sovereign (Approval)', icon: '👑' }
];

export default function GuildChat({ sandboxId, onFilesChanged }) {
  const [decree, setDecree] = useState('');
  const [logs, setLogs] = useState([]);
  const [activePhase, setActivePhase] = useState('shogun_council');
  const [taskBoard, setTaskBoard] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [pendingDiff, setPendingDiff] = useState('');
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Council Standing By');
  const logBottomRef = useRef(null);

  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const dispatchDecree = useCallback(async () => {
    const text = decree.trim();
    if (!text || !sandboxId || isCampaignRunning) return;

    setIsCampaignRunning(true);
    setStatusMessage('Guild Campaign in Progress...');
    setLogs([`👑 Decree Issued: "${text}"\n`]);
    setEvidence([]);

    try {
      const response = await fetch('/api/ai/guild/decree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decree: text, projectId: sandboxId })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop();

        for (const ev of events) {
          if (!ev.startsWith('data: ')) continue;
          try {
            const { type, data } = JSON.parse(ev.replace('data: ', ''));

            if (type === 'log') {
              setLogs(prev => [...prev, data]);
            } else if (type === 'state_update') {
              if (data.currentPhase) setActivePhase(data.currentPhase);
              if (data.taskBoard?.length) setTaskBoard(data.taskBoard);
              if (data.acceptanceCriteria?.length) setCriteria(data.acceptanceCriteria);
              if (data.evidenceLedger?.length) setEvidence(data.evidenceLedger);
            } else if (type === 'mission_ready_for_approval') {
              setPendingDiff(data.diff || 'Files modified directly in workspace.');
              setApprovalModalOpen(true);
              setStatusMessage('Awaiting Sovereign Approval');
              onFilesChanged?.();
            }
          } catch (e) {
            // non-json line
          }
        }
      }
    } catch (err) {
      setLogs(prev => [...prev, `❌ Campaign Error: ${err.message}\n`]);
      setStatusMessage('Campaign Encountered Error');
    } finally {
      setIsCampaignRunning(false);
    }
  }, [decree, sandboxId, isCampaignRunning, onFilesChanged]);

  const handleApproval = async (approved) => {
    try {
      await fetch('/api/ai/guild/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: sandboxId, approved })
      });
      setLogs(prev => [...prev, approved ? '\n👑 Sovereign SEAL APPLIED: Changes merged and approved!\n' : '\n👑 Sovereign REJECTED: Guild instructed to revise.\n']);
      setStatusMessage(approved ? 'Mission Accomplished' : 'Standing Down');
    } catch (e) {
      //
    }
    setApprovalModalOpen(false);
    onFilesChanged?.();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: '#0a0f1d', borderLeft: '1px solid #1e2d45', color: '#cbd5e1' }}>

      {/* Header */}
      <div className="p-3 shrink-0" style={{ borderBottom: '1px solid #1e2d45', background: '#070b14' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🏯</span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#38bdf8' }}>DevPilot Guild</h2>
              <p className="text-[10px]" style={{ color: '#64748b' }}>Autonomous AI Engineering</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
            style={{
              background: isCampaignRunning ? 'rgba(56,189,248,0.15)' : 'rgba(16,185,129,0.15)',
              color: isCampaignRunning ? '#38bdf8' : '#34d399',
              border: `1px solid ${isCampaignRunning ? '#0284c7' : '#059669'}`
            }}>
            {statusMessage}
          </span>
        </div>

        {/* Phase Badges */}
        <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-mono">
          {GUILD_PHASES.map((p) => {
            const isActive = activePhase === p.id;
            return (
              <div key={p.id}
                title={p.title}
                className="p-1 rounded transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? '#38bdf8' : '#1e293b'}`,
                  color: isActive ? '#38bdf8' : '#64748b',
                  fontWeight: isActive ? 'bold' : 'normal',
                  boxShadow: isActive ? '0 0 10px rgba(56,189,248,0.3)' : 'none'
                }}>
                <div className="text-xs">{p.icon}</div>
                <div className="truncate text-[9px]">{p.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 font-mono text-[11px]">
        {/* Acceptance Criteria Checklist */}
        {criteria.length > 0 && (
          <div className="p-2.5 rounded-lg" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <div className="flex items-center justify-between mb-1.5 font-semibold" style={{ color: '#e2e8f0' }}>
              <span>📋 Acceptance Criteria</span>
              <span className="text-[10px]" style={{ color: '#38bdf8' }}>
                {criteria.filter(c => c.verified).length}/{criteria.length} Verified
              </span>
            </div>
            <div className="space-y-1">
              {criteria.map((c) => (
                <div key={c.id} className="flex items-start gap-1.5 leading-snug">
                  <span>{c.verified ? '✅' : '⏳'}</span>
                  <span style={{ color: c.verified ? '#cbd5e1' : '#94a3b8' }}>{c.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transmission Terminal Log */}
        <div className="p-2.5 rounded-lg overflow-y-auto leading-relaxed"
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            color: '#93c5fd',
            height: '240px',
            fontFamily: 'monospace'
          }}>
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">No decree dispatched. Plan like a Shogun, Build like a Samurai, Test like a Sentinel.</div>
          ) : (
            logs.map((log, i) => <div key={i} className="whitespace-pre-wrap">{log}</div>)
          )}
          <div ref={logBottomRef} />
        </div>

        {/* Evidence Ledger */}
        {evidence.length > 0 && (
          <div className="p-2.5 rounded-lg" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <div className="font-semibold mb-1.5" style={{ color: '#e2e8f0' }}>📜 Evidence Ledger</div>
            <div className="space-y-1">
              {evidence.map((ev, i) => (
                <div key={i} className="p-1 rounded flex items-center justify-between text-[10px]"
                  style={{ background: '#070b14', border: '1px solid #1e2d45' }}>
                  <div className="truncate mr-2">
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>[{ev.checkType.toUpperCase()}]</span> {ev.details}
                  </div>
                  <span className="px-1.5 py-0.2 rounded font-bold"
                    style={{
                      background: ev.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: ev.passed ? '#34d399' : '#f87171'
                    }}>
                    {ev.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decree Input Bar */}
      <div className="p-2.5 shrink-0" style={{ borderTop: '1px solid #1e2d45', background: '#070b14' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={decree}
            onChange={(e) => setDecree(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && dispatchDecree()}
            placeholder={sandboxId ? "Issue decree (e.g. 'Add unit test & dark mode')..." : "Start sandbox first..."}
            disabled={!sandboxId || isCampaignRunning}
            className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
            style={{
              background: '#0a0f1d',
              border: '1px solid #1e2d45',
              color: '#e2e8f0',
              caretColor: '#38bdf8'
            }}
          />
          <button
            onClick={dispatchDecree}
            disabled={!decree.trim() || !sandboxId || isCampaignRunning}
            className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200"
            style={{
              background: decree.trim() && sandboxId && !isCampaignRunning
                ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                : 'rgba(255,255,255,0.05)',
              color: decree.trim() && sandboxId && !isCampaignRunning ? '#ffffff' : '#475569',
              boxShadow: decree.trim() && sandboxId && !isCampaignRunning ? '0 0 12px rgba(2,132,199,0.4)' : 'none'
            }}>
            {isCampaignRunning ? 'Campaigning...' : 'Dispatch'}
          </button>
        </div>
      </div>

      {/* Human Sovereign Approval Gate Modal */}
      {approvalModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
          <div className="rounded-xl max-w-xl w-full p-5 shadow-2xl"
            style={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.4)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👑</span>
              <h3 className="text-base font-bold" style={{ color: '#38bdf8' }}>Human Sovereign Authorization Required</h3>
            </div>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
              The Guild has planned, built, tested, and verified the decree. Inspect the verified git diff below before approving:
            </p>

            <div className="p-3 rounded-lg overflow-y-auto mb-4 font-mono text-[11px] whitespace-pre"
              style={{ background: '#050811', border: '1px solid #1e293b', color: '#4ade80', maxHeight: '220px' }}>
              {pendingDiff || "Clean modification set verified."}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleApproval(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: '#450a0a', color: '#fca5a5', border: '1px solid #991b1b' }}>
                Reject & Request Changes
              </button>
              <button
                onClick={() => handleApproval(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#ffffff',
                  boxShadow: '0 0 15px rgba(5,150,105,0.4)'
                }}>
                Approve & Merge Decree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
