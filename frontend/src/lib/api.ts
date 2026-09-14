const API_BASE = "";
const API_KEY = (import.meta.env.VITE_API_KEY as string) || "dev-local-key-change-me";

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

function authHeaders(): HeadersInit {
  return { "X-API-Key": API_KEY };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then((r) => json<{ status: string }>(r)),
  summary: () =>
    fetch(`${API_BASE}/api/dashboard/summary`, { headers: authHeaders() }).then((r) => json<DashboardSummary>(r)),
  samples: () => fetch(`${API_BASE}/api/samples`, { headers: authHeaders() }).then((r) => json<QueueSample[]>(r)),
  exportEvents: () => downloadFile(`${API_BASE}/api/samples/export`, "queuesense_samples.csv"),
  runDemo: () =>
    fetch(`${API_BASE}/api/analyze/demo`, { method: "POST", headers: authHeaders() }).then((r) =>
      json<AnalysisSession>(r)
    ),
  analyzeVideo: (file: File) => {
    const form = new FormData();
    form.set("file", file);
    return fetch(`${API_BASE}/api/analyze/video`, { method: "POST", headers: authHeaders(), body: form }).then((r) =>
      json<AnalysisSession>(r)
    );
  },
};
