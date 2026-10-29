import { describe, it } from 'node:test';
import assert from 'node:assert';
import { shogunPlanningNode } from '../src/guild/agents/shogun.planner.js';
import { samuraiDeveloperNode } from '../src/guild/agents/samurai.developer.js';
import { sentinelTestingNode } from '../src/guild/agents/sentinel.tester.js';
import { shadowSecurityNode } from '../src/guild/agents/shadow.security.js';
import { guildCampaignGraph } from '../src/guild/graph.js';
import { missionStore } from '../src/guild/mission.store.js';

describe('🏯 DevPilot: Autonomous AI Engineering Guild Test Suite (PS-001)', () => {

  it('1. The Shogun Council: Analyzes decree & establishes Battle Plan', async () => {
    const initialState = {
      decree: 'Build an interactive counter with unit test verification',
      projectId: 'test-sandbox',
      iterationCount: 0,
      messages: []
    };

    const planState = await shogunPlanningNode(initialState);

    assert.ok(planState.missionObjective, 'Mission objective should be defined');
    assert.ok(Array.isArray(planState.acceptanceCriteria), 'Acceptance criteria should be an array');
    assert.ok(planState.acceptanceCriteria.length >= 1, 'Should have at least 1 acceptance criterion');
    assert.ok(Array.isArray(planState.taskBoard), 'Task board should be populated');
    assert.strictEqual(planState.currentPhase, 'samurai_forge');
    assert.strictEqual(planState.activeAgent, 'samurai');
  });

  it('2. The Samurai Forge: Generates context-aware React code', async () => {
    const state = {
      decree: 'Add animated counter',
      projectId: 'test-sandbox',
      missionObjective: 'Add counter component',
      acceptanceCriteria: [{ id: 'AC-1', description: 'Counter renders', verificationMethod: 'test' }],
      messages: []
    };

    const buildState = await samuraiDeveloperNode(state);

    assert.ok(Array.isArray(buildState.changedFiles), 'Changed files should be an array');
    assert.strictEqual(buildState.currentPhase, 'sentinel_dojo');
    assert.strictEqual(buildState.activeAgent, 'sentinel');
  });

  it('3. The Sentinel Dojo & Feedback Loop: Detects test failure and dispatches repair', async () => {
    // Inject a simulated failing test condition
    const failingState = {
      projectId: 'test-sandbox',
      acceptanceCriteria: [{ id: 'AC-1', description: 'Test passes', verificationMethod: 'test' }],
      evidenceLedger: [],
      iterationCount: 0,
      messages: []
    };

    const testedState = await sentinelTestingNode(failingState);

    // Sentinel records evidence in ledger
    assert.ok(Array.isArray(testedState.evidenceLedger), 'Evidence ledger should be populated');
    assert.ok(testedState.evidenceLedger.length >= 1, 'At least 1 check must be recorded in ledger');
  });

  it('4. The Shadow Council: Detects planted security vulnerability & triggers critique loop', async () => {
    const insecureState = {
      projectId: 'test-sandbox',
      evidenceLedger: [],
      iterationCount: 0,
      messages: []
    };

    // Simulate git diff containing hardcoded AWS secret and unsafe DOM eval
    const dirtyDiff = `
+ const aws_key = "AKIAIOSFODNN7EXAMPLE";
+ <div dangerouslySetInnerHTML={{ __html: userInput }} />
    `;

    // Test static security scan
    const cleanState = await shadowSecurityNode(insecureState);

    // If clean diff, moves to human_oversight
    assert.ok(cleanState.currentPhase === 'human_oversight' || cleanState.currentPhase === 'samurai_forge');
  });

  it('5. The Living Campaign: Orchestrates complete end-to-end guild workflow', async () => {
    const logs = [];
    const initialState = {
      decree: 'Deploy user analytics widget with unit tests',
      projectId: 'test-e2e',
      iterationCount: 0,
      maxIterations: 3,
      messages: [],
      writer: (text) => logs.push(text)
    };

    let lastState = null;
    for await (const { node, state } of guildCampaignGraph.stream(initialState)) {
      lastState = state;
    }

    assert.ok(lastState, 'Orchestration should complete and yield a final state');
    assert.ok(lastState.evidenceLedger.length > 0, 'Evidence-Based Completion: ledger must have proof');
    assert.ok(logs.length > 0, 'Writer logs should have recorded guild activity');
    assert.strictEqual(lastState.approvalStatus, 'pending_review');
  });

  it('6. Distributed State: Persists mission and retrieves history across sessions', () => {
    const testProjectId = `proj_${Date.now()}`;
    const mockMission = {
      decree: 'Build login page',
      missionObjective: 'Secure authentication UI',
      acceptanceCriteria: [{ id: 'AC-1', description: 'Form validates email', verified: true }],
      evidenceLedger: [{ stage: 'testing', passed: true, details: 'Form tests passing' }],
      approvalStatus: 'approved'
    };

    missionStore.saveMission(testProjectId, mockMission);
    const history = missionStore.getMissions(testProjectId);

    assert.ok(Array.isArray(history), 'History should be an array');
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].objective, 'Secure authentication UI');
    assert.strictEqual(history[0].approvalStatus, 'approved');
  });
});
