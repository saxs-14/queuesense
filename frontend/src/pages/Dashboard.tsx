import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api, DashboardSummary, QueueSample } from "../lib/api";
import KpiCard from "../components/KpiCard";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [samples, setSamples] = useState<QueueSample[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, samp] = await Promise.all([api.summary(), api.samples()]);
      setSummary(s);
      setSamples(samp);
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    refresh();
  }, [refresh]);

  const runDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.runDemo();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const runUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await api.analyzeVideo(file);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const chartData = samples
    .slice(0, 40)
    .reverse()
    .map((s) => ({ t: `${s.offset_seconds}s`, count: s.person_count }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500" />
          QueueSense
        </Link>
        <span className="flex items-center gap-2 text-xs">
          <span className={`inline-block h-2 w-2 rounded-full ${apiOnline ? "bg-emerald-500" : "bg-red-500"}`} />
          {apiOnline === null ? "Checking..." : apiOnline ? "Backend online" : "Backend offline"}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {!apiOnline && apiOnline !== null && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
            Can't reach the backend at <code>/api</code>. Start it with <code>uvicorn app.main:app --reload</code>.
          </div>
        )}

        {summary?.currently_over_threshold && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
            Crowd alert: latest reading is at or above the configured threshold of{" "}
            {summary.crowd_alert_threshold} people.
          </div>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold mb-4">Analyze footage</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200"
            />
            <button
              disabled={!file || loading}
              onClick={runUpload}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {loading ? "Analyzing..." : "Analyze upload"}
            </button>
            <span className="text-slate-500 text-sm">or</span>
            <button
              disabled={loading}
              onClick={runDemo}
              className="rounded-lg border border-slate-700 hover:border-slate-500 disabled:opacity-40 transition px-4 py-2 text-sm font-medium"
            >
              {loading ? "Running..." : "Run demo clip"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Average queue length" value={summary?.avg_queue_length ?? "-"} />
          <KpiCard label="Peak queue length" value={summary?.peak_queue_length ?? "-"} />
          <KpiCard label="Estimated wait" value={summary ? `${summary.estimated_wait_minutes} min` : "-"} />
          <KpiCard label="Sessions analyzed" value={summary?.total_sessions ?? "-"} />
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold mb-4">Queue length over time</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500">No samples yet — run the demo or upload footage above.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="t" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Sample history</h2>
            <a href={api.exportCsvUrl()} className="text-sm rounded-lg border border-slate-700 hover:border-slate-500 transition px-3 py-1.5">
              Export CSV
            </a>
          </div>
          {samples.length === 0 ? (
            <p className="text-sm text-slate-500">No samples recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-4">Offset</th>
                  <th className="py-2 pr-4">People counted</th>
                  <th className="py-2 pr-4">Est. wait</th>
                  <th className="py-2 pr-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/60">
                    <td className="py-2 pr-4">{s.offset_seconds}s</td>
                    <td className="py-2 pr-4">{s.person_count}</td>
                    <td className="py-2 pr-4">{s.estimated_wait_minutes} min</td>
                    <td className="py-2 pr-4 text-slate-500">{new Date(s.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
