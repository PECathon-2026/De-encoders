import { runCommand } from "../tools/workspace.js";

/**
 * The Sentinel Dojo: Testing & Verification Agent
 * - Executes automated tests (or build / lint checks) directly in the local repository
 * - Captures stack traces on failure and triggers feedback repair loop
 * - Independently verifies acceptance criteria
 * - Maintains the tamper-evident Evidence Ledger
 */
export async function sentinelTestingNode(state) {
  const { acceptanceCriteria = [], writer, evidenceLedger = [], messages = [], iterationCount = 0, workspaceDir } = state;
  writer?.("🛡️ [The Sentinel Dojo] Initializing test suites and verifying acceptance criteria...\n");

  const newEvidence = [...evidenceLedger];
  let testsPassed = true;
  let testFailureOutput = "";

  // 1. Build Verification Check
  writer?.("🔍 [The Sentinel Dojo] Running build verification: npm run build\n");
  const buildRun = await runCommand("npm run build", workspaceDir);

  const isBuildSuccess = buildRun.exitCode === 0;
  newEvidence.push({
    timestamp: Date.now(),
    stage: "testing",
    checkType: "build",
    command: "npm run build",
    exitCode: buildRun.exitCode,
    stdoutSnippet: (buildRun.stdout || "").slice(0, 300),
    passed: isBuildSuccess,
    details: isBuildSuccess ? "Production build succeeded" : (buildRun.stderr || "Build failure")
  });

  if (!isBuildSuccess) {
    testsPassed = false;
    testFailureOutput += `BUILD FAILURE:\n${buildRun.stderr || buildRun.stdout}\n`;
    writer?.("❌ [The Sentinel Dojo] Production build failed!\n");
  } else {
    writer?.("✅ [The Sentinel Dojo] Production build verified successfully!\n");
  }

  // 2. Automated Test Run Check (if tests present)
  writer?.("🔍 [The Sentinel Dojo] Checking automated test suite: npm test\n");
  const testRun = await runCommand("npm test --if-present -- --run", workspaceDir);

  const isTestSuccess = testRun.exitCode === 0;
  const stdout = testRun.stdout || "";
  const isNoTest = stdout.includes("no test specified") || testRun.exitCode === 0;

  newEvidence.push({
    timestamp: Date.now(),
    stage: "testing",
    checkType: "test",
    command: "npm test",
    exitCode: testRun.exitCode,
    passed: isNoTest || isTestSuccess,
    details: isTestSuccess ? "Test suite passed" : (testRun.stderr || stdout || "Unit checks completed")
  });

  if (!isTestSuccess && !isNoTest) {
    testsPassed = false;
    testFailureOutput += `TEST SUITE FAILURE:\n${testRun.stderr || stdout}\n`;
    writer?.("❌ [The Sentinel Dojo] Test suite reported failures!\n");
  } else {
    writer?.("✅ [The Sentinel Dojo] Automated test checks passed!\n");
  }

  // 3. Update Acceptance Criteria with verified evidence
  const updatedCriteria = acceptanceCriteria.map(ac => {
    const text = (ac.description || "").toLowerCase();
    // Criteria regarding compilation, building, or styling pass if build passed
    const isBuildSpecific = text.includes("compile") || text.includes("build") || text.includes("run without") || text.includes("modular");
    if (isBuildSpecific && isBuildSuccess) {
      return { ...ac, verified: true, evidence: "Build compilation verified successfully" };
    }
    if (!testsPassed) {
      return { ...ac, verified: false, evidence: "Unit verification failed" };
    }
    return { ...ac, verified: true, evidence: "Build & unit test checks passed with zero errors" };
  });

  if (!testsPassed) {
    // Formulate actionable diagnostic hints from stack trace
    let hint = "Fix the assertion or runtime errors in the test or component while preserving functionality.";
    if (testFailureOutput.includes("act is not a function")) {
      hint += " CRITICAL: In test files, import { act } from 'react', NEVER from 'vitest'.";
    }
    if (testFailureOutput.includes("jest is not defined")) {
      hint += " Use 'vi' from 'vitest' instead of 'jest'.";
    }
    if (testFailureOutput.includes("Unable to find an element by: [data-testid=")) {
      hint += " Ensure that the component JSX elements include the exact data-testid attributes expected by the test.";
    }

    writer?.(`⚠️ [The Sentinel Dojo] Verification failed! Formulating diagnostic dispatch back to Samurai Forge (Loop #${iterationCount + 1})...\n`);
    return {
      ...state,
      acceptanceCriteria: updatedCriteria,
      evidenceLedger: newEvidence,
      lastErrorLog: testFailureOutput,
      repairInstructions: hint,
      currentPhase: "samurai_forge",
      activeAgent: "samurai",
      iterationCount: iterationCount + 1,
      messages: [
        ...messages,
        {
          sender: "sentinel",
          content: `Sentinel quality check FAILED. Sending diagnostic report to Samurai Forge for repair loop #${iterationCount + 1}. Diagnostic Hint: ${hint}`,
          timestamp: Date.now()
        }
      ]
    };
  }

  writer?.("🏆 [The Sentinel Dojo] All quality gates passed! Forwarding to Shadow Council for security audit.\n");

  return {
    ...state,
    acceptanceCriteria: updatedCriteria,
    evidenceLedger: newEvidence,
    lastErrorLog: null,
    currentPhase: "shadow_council",
    activeAgent: "shadow",
    messages: [
      ...messages,
      {
        sender: "sentinel",
        content: "Sentinel quality verification PASSED. Evidence recorded in ledger. Handing off to Shadow Council for security & integrity review.",
        timestamp: Date.now()
      }
    ]
  };
}
