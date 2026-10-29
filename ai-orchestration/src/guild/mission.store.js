import fs from 'fs';
import path from 'path';

/**
 * Distributed State & Persistent Mission Store
 * Provides mission history across restarts and sessions.
 * Fulfills Step 2 of the Production Blueprint.
 */
class MissionStore {
  constructor() {
    this.memoryStore = new Map();
    this.persistPath = path.resolve(process.cwd(), '.missions.json');
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(this.persistPath)) {
        const raw = fs.readFileSync(this.persistPath, 'utf8');
        const data = JSON.parse(raw);
        for (const [key, value] of Object.entries(data)) {
          this.memoryStore.set(key, value);
        }
      }
    } catch (e) {
      // Ignore disk load error
    }
  }

  saveToDisk() {
    try {
      const obj = Object.fromEntries(this.memoryStore.entries());
      fs.writeFileSync(this.persistPath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
      // Ignore write error
    }
  }

  saveMission(projectId, missionState) {
    const list = this.memoryStore.get(projectId) || [];
    const record = {
      id: `mission_${Date.now()}`,
      decree: missionState.decree,
      objective: missionState.missionObjective,
      criteria: missionState.acceptanceCriteria,
      evidenceLedger: missionState.evidenceLedger,
      approvalStatus: missionState.approvalStatus,
      timestamp: Date.now()
    };
    list.unshift(record);
    // Keep last 20 missions per project
    this.memoryStore.set(projectId, list.slice(0, 20));
    this.saveToDisk();
    return record;
  }

  getMissions(projectId) {
    return this.memoryStore.get(projectId) || [];
  }
}

export const missionStore = new MissionStore();
