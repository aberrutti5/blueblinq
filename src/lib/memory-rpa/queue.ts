import type { MemoryCredentials, RpaJobResult } from "./types";
import { executeInvoiceEntry } from "./executor";

interface QueueItem {
  jobId: string;
  invoiceId: string;
  credentials: MemoryCredentials;
}

const jobResults = new Map<string, RpaJobResult>();
const queue: QueueItem[] = [];
let isProcessing = false;

export function enqueueJob(
  invoiceId: string,
  credentials: MemoryCredentials
): string {
  const jobId = crypto.randomUUID();

  jobResults.set(jobId, {
    jobId,
    invoiceId,
    status: "PENDING",
    steps: [],
  });

  queue.push({ jobId, invoiceId, credentials });

  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }

  return jobId;
}

export function getJobStatus(jobId: string): RpaJobResult | null {
  return jobResults.get(jobId) ?? null;
}

export function enqueueJobs(
  invoiceIds: string[],
  credentials: MemoryCredentials
): string[] {
  return invoiceIds.map((id) => enqueueJob(id, credentials));
}

export function getActiveJobs(): RpaJobResult[] {
  return Array.from(jobResults.values()).filter(
    (j) => j.status === "PENDING" || j.status === "RUNNING"
  );
}

export function getAllJobs(): RpaJobResult[] {
  return Array.from(jobResults.values());
}

async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const item = queue.shift()!;

    // Update status to RUNNING
    const pending = jobResults.get(item.jobId);
    if (pending) {
      pending.status = "RUNNING";
      pending.startedAt = new Date();
    }

    const result = await executeInvoiceEntry(item.invoiceId, item.credentials);
    result.jobId = item.jobId;
    jobResults.set(item.jobId, result);
  }

  isProcessing = false;
}
