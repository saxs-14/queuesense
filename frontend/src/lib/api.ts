const API_BASE = "";

export interface QueueSample {
  id: number;
  session_id: string;
  offset_seconds: number;
  person_count: number;
  estimated_wait_minutes: number;
  timestamp: string;
}

export interface AnalysisSession {
  id: string;
  source_filename: string;
  total_samples: number;
  avg_count: number;
  peak_count: number;
  status: string;
}

export interface DashboardSummary {
  avg_queue_length: number;
  peak_queue_length: number;
  estimated_wait_minutes: number;
  total_sessions: number;
  crowd_alert_threshold: number;
  currently_over_threshold: boolean;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then((r) => json<{ status: string }>(r)),
  summary: () => fetch(`${API_BASE}/api/dashboard/summary`).then((r) => json<DashboardSummary>(r)),
  samples: () => fetch(`${API_BASE}/api/samples`).then((r) => json<QueueSample[]>(r)),
  exportCsvUrl: () => `${API_BASE}/api/samples/export`,
  runDemo: () => fetch(`${API_BASE}/api/analyze/demo`, { method: "POST" }).then((r) => json<AnalysisSession>(r)),
  analyzeVideo: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return fetch(`${API_BASE}/api/analyze/video`, { method: "POST", body: form }).then((r) => json<AnalysisSession>(r));
  },
};
