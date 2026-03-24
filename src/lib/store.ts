import { getCurrentWorkspace } from "@/lib/auth/workspace";
import { getDefaultWorkspaceId } from "@/lib/db/default-workspace";
import { companyRepository } from "@/lib/repositories/company-repository";
import { goalRepository } from "@/lib/repositories/goal-repository";
import { workflowRunRepository } from "@/lib/repositories/workflow-run-repository";

// Session-aware workspace resolver.
// Authenticated pages/routes get their workspace from the session.
// Falls back to the demo default workspace if no session exists.
export async function resolveWorkspaceId(): Promise<string> {
  const workspace = await getCurrentWorkspace();
  if (workspace) return workspace.id;
  return getDefaultWorkspaceId();
}

export async function listCompanies() {
  const workspaceId = await resolveWorkspaceId();
  return companyRepository.listByWorkspaceId(workspaceId);
}

export async function listGoals() {
  const workspaceId = await resolveWorkspaceId();
  return goalRepository.listByWorkspaceId(workspaceId);
}

export async function listWorkflowRuns() {
  const workspaceId = await resolveWorkspaceId();
  return workflowRunRepository.listByWorkspaceId(workspaceId);
}

export async function getCompany(companyId: string) {
  const workspaceId = await resolveWorkspaceId();
  return companyRepository.findByIdInWorkspace(companyId, workspaceId);
}

export async function getGoal(goalId: string) {
  const workspaceId = await resolveWorkspaceId();
  return goalRepository.findByIdInWorkspace(goalId, workspaceId);
}

export async function getWorkflowRun(runId: string) {
  const workspaceId = await resolveWorkspaceId();
  return workflowRunRepository.findByIdInWorkspace(runId, workspaceId);
}

export async function createCompany(input: { name: string; idea: string }) {
  const workspaceId = await resolveWorkspaceId();
  return companyRepository.createInWorkspace({ workspaceId, ...input });
}

export async function createGoal(input: { companyId: string; title: string; task: string }) {
  const workspaceId = await resolveWorkspaceId();
  return goalRepository.createInWorkspace({ workspaceId, ...input });
}
