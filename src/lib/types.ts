export type AgentRole = "strategist" | "operator" | "reviewer";

export type ArtifactType = "brief" | "execution-plan" | "checklist" | "review";

export type ArtifactStatus = "ready" | "approved";

export interface CompanyAgentAssignment {
  role: AgentRole;
  agentId: string;
  agentName: string;
  agentHeadline: string;
}

export interface AgentStateRecord {
  agentId: string;
  active: boolean;
  hiredAt: string;
}

// Prisma returns Company without agentAssignments — agents are resolved from catalog
export interface Company {
  id: string;
  name: string;
  idea: string;
  agentAssignments?: CompanyAgentAssignment[];
  createdAt: string | Date;
}

export interface Goal {
  id: string;
  companyId: string;
  title: string;
  task: string;
  createdAt: string | Date;
}

export interface Artifact {
  id: string;
  runId: string;
  role: AgentRole;
  type: ArtifactType;
  title: string;
  summary: string;
  content: string[];
  status: ArtifactStatus;
  createdAt: string | Date;
}

export interface WorkflowRun {
  id: string;
  companyId: string;
  goalId: string;
  task: string;
  status: string;
  artifacts: Artifact[];
  createdAt: string | Date;
}

export interface UsageRecord {
  id: string;
  workflowRunId?: string | null;
  metric: string;
  value: number;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
}
