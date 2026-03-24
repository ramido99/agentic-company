import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { AgentStateRecord, Company, Goal, UsageRecord, WorkflowRun } from "@/lib/types";

export type FileStoreState = {
  companies: Company[];
  goals: Goal[];
  workflowRuns: WorkflowRun[];
  usageRecords: UsageRecord[];
  agentStates: AgentStateRecord[];
};

const storePath = path.join(process.cwd(), ".data", "agentic-company.json");

const emptyState: FileStoreState = {
  companies: [],
  goals: [],
  workflowRuns: [],
  usageRecords: [],
  agentStates: [],
};

export function createLocalId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

async function ensureStore() {
  await mkdir(path.dirname(storePath), { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(emptyState, null, 2), "utf8");
  }
}

export async function readFileStore() {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<FileStoreState>;

  return {
    companies: Array.isArray(parsed.companies)
      ? parsed.companies.map((company) => ({
          ...company,
          agentAssignments: Array.isArray(company.agentAssignments) ? company.agentAssignments : [],
        }))
      : [],
    goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    workflowRuns: Array.isArray(parsed.workflowRuns) ? parsed.workflowRuns : [],
    usageRecords: Array.isArray(parsed.usageRecords) ? parsed.usageRecords : [],
    agentStates: Array.isArray(parsed.agentStates) ? parsed.agentStates : [],
  };
}

export async function writeFileStore(state: FileStoreState) {
  await writeFile(storePath, JSON.stringify(state, null, 2), "utf8");
}
