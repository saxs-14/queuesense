import { Link } from "react-router-dom";

const FEATURES = [
  { title: "Anonymous people counting", desc: "Counts people in frame without identifying anyone." },
  { title: "Waiting-time estimate", desc: "Converts queue length into an estimated wait using a configurable service rate." },
  { title: "Peak-period tracking", desc: "See when queues are longest across the day." },
  { title: "Crowd alerts", desc: "Flags when the queue crosses a configurable threshold." },
  { title: "Historical analytics", desc: "Sample-level history with CSV export." },
  { title: "Demo mode", desc: "Run on a bundled real people-counting clip." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500" />
          QueueSense
        </div>
        <Link to="/app" className="rounded-lg bg-cyan-600 hover:bg-cyan-500 transition px-4 py-2 text-sm font-medium">
          Open dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Know your <span className="text-cyan-400">queues</span>, without watching them
          </h1>
          <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
            Camera in, waiting-time estimate out — anonymous people counting for clinics,
            banks, and government offices.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/app" className="rounded-lg bg-cyan-600 hover:bg-cyan-500 transition px-5 py-3 font-medium">
              Try the live demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            No individual is identified or tracked — every count is anonymous.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="py-16 grid sm:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-3">Who it's for</h2>
            <ul className="text-slate-400 space-y-1.5 text-sm">
              <li>Clinics and hospitals</li>
              <li>Banks</li>
              <li>Government offices</li>
              <li>Retail stores</li>
              <li>Universities & airports</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Pricing model</h2>
            <ul className="text-slate-400 space-y-1.5 text-sm">
              <li>Per-location monthly subscription</li>
              <li>Analytics-only subscription</li>
              <li>Enterprise multi-site dashboard</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        QueueSense — queue analytics MVP. Counts are estimates, not precise headcounts.
      </footer>
    </div>
  );
}
