import { getGitDiff } from "../tools/workspace.js";

/**
 * The Shadow Council: Review, Security & Human Gate Agent
 * - Inspects local git diffs for readability, correctness, and style
 * - Performs static security scans (exposed secrets, unsafe eval, XSS)
 * - Cross-agent critique: routes security flaws back to Samurai Forge
 * - Prepares verified findings for Human Sovereign authorization
 */
export async function shadowSecurityNode(state) {
  const { writer, evidenceLedger = [], messages = [], iterationCount = 0, workspaceDir } = state;
  writer?.("🌑 [The Shadow Council] Commencing security audit & static vulnerability inspection...\n");

  const diffResult = await getGitDiff(workspaceDir);
  const gitDiff = diffResult.diff || "";

  // 1. Static Security Rule Scan
  const securityFindings = [];

  // Rule A: Exposed API keys or secrets
  const secretPatterns = [
    { pattern: /AKIA[0-9A-Z]{16}/, name: "AWS Access Key" },
    { pattern: /AIza[0-9A-Za-z-_]{35}/, name: "Google API Key" },
    { pattern: /ghp_[0-9a-zA-Z]{36}/, name: "GitHub Personal Token" },
    { pattern: /sk-[a-zA-Z0-9]{48}/, name: "OpenAI Secret Key" },
    { pattern: /password\s*[:=]\s*['"][^'"]+['"]/i, name: "Hardcoded Password" }
  ];

  for (const { pattern, name } of secretPatterns) {
    if (pattern.test(gitDiff)) {
      securityFindings.push({
        severity: "critical",
        rule: "NO_EXPOSED_SECRETS",
        file: "codebase",
        description: `Hardcoded ${name} detected in changes.`,
        remediationAdvice: "Store secret in environment variables instead of source files."
      });
    }
  }

  // Rule B: Unsafe operations (eval, dangerouslySetInnerHTML)
  if (/eval\(|dangerouslySetInnerHTML/i.test(gitDiff)) {
    securityFindings.push({
      severity: "high",
      rule: "UNSAFE_DOM_OR_EVAL",
      file: "codebase",
      description: "Detected use of eval() or dangerouslySetInnerHTML introducing XSS risks.",
      remediationAdvice: "Use standard JSX rendering or sanitize untrusted strings."
    });
  }

  const hasCriticalSecurityIssues = securityFindings.some(f => f.severity === "critical" || f.severity === "high");

  if (hasCriticalSecurityIssues) {
    writer?.(`🚨 [The Shadow Council] Security issues detected! Routing critique back to Samurai Forge (Loop #${iterationCount + 1})...\n`);
    return {
      ...state,
      securityFindings,
      currentPhase: "samurai_forge",
      activeAgent: "samurai",
      repairInstructions: `Remediate security violations: ${securityFindings.map(f => f.description).join("; ")}`,
      iterationCount: iterationCount + 1,
      messages: [
        ...messages,
        {
          sender: "shadow",
          content: `Shadow Council REJECTED code due to security vulnerabilities: ${securityFindings.map(f => f.description).join(", ")}. Escalating to Samurai Forge.`,
          timestamp: Date.now()
        }
      ]
    };
  }

  writer?.("🛡️ [The Shadow Council] Security inspection passed with zero critical vulnerabilities.\n");

  const newEvidence = [
    ...evidenceLedger,
    {
      timestamp: Date.now(),
      stage: "security",
      checkType: "security_scan",
      passed: true,
      details: "Passed static secret detection and XSS audit with clean rating"
    }
  ];

  return {
    ...state,
    evidenceLedger: newEvidence,
    securityFindings: [],
    gitDiffSummary: gitDiff,
    currentPhase: "human_oversight",
    activeAgent: "human",
    approvalStatus: "pending_review",
    messages: [
      ...messages,
      {
        sender: "shadow",
        content: "Security audit PASSED. Changes and evidence ledger ready for Human Sovereign authorization.",
        timestamp: Date.now()
      }
    ]
  };
}
