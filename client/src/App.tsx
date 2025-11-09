import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

type Meta = {
  difficulties: string[];
  tags: string[];
  total: number;
};

type Question = {
  id: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags: string[];
  paidOnly: boolean;
};

export default function App() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [difficulty, setDifficulty] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [excludePaid, setExcludePaid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ count: number; question: Question | null; link?: string } | null>(null);

  useEffect(() => {
    fetch('/api/meta').then(r => r.json()).then(setMeta).catch(() => setMeta(null));
  }, []);

  const canSpin = useMemo(() => !loading && !!meta, [loading, meta]);

  async function spin() {
    if (!canSpin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (difficulty) params.set('difficulty', difficulty);
      if (tag) params.set('tag', tag);
      params.set('excludePaid', String(excludePaid));
      const res = await fetch('/api/roulette?' + params.toString());
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">
        <div className="w-full max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/leetcode.svg" alt="LeetCode" className="h-9 w-9" />
            <span className="font-brand font-extrabold tracking-tight text-slate-100 text-2xl">LeetCode Roulette</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="https://leetcode.com" target="_blank" className="text-base text-blue-300 hover:text-blue-200">LeetCode</a>
            <a href="https://github.com/" target="_blank" className="text-base text-slate-300 hover:text-white/90">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Main content centered to screen */}
      <main className="grid h-[calc(100vh-80px)] place-items-center px-4 py-12 overflow-hidden">
        <div className="w-full max-w-3xl flex flex-col gap-6 text-center">
          <header>
          <h1 className="text-3xl font-bold">Spin a Coding Challenge</h1>
          <p className="text-sm text-slate-400">Pick filters, then let fate decide.</p>
          </header>

          <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium">Difficulty</label>
            <select className="w-full border border-slate-700 bg-slate-900 rounded-md px-2 py-2" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="">Any</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2 w-full">
            <label className="text-sm font-medium">Topic</label>
            <select className="w-full border border-slate-700 bg-slate-900 rounded-md px-2 py-2" value={tag} onChange={e => setTag(e.target.value)}>
              <option value="">Any</option>
              {meta?.tags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-3 w-full">
            <span className="text-sm text-slate-300">Exclude Paid</span>
            <label htmlFor="exclude-paid" className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="exclude-paid"
                type="checkbox"
                checked={excludePaid}
                onChange={e => setExcludePaid(e.target.checked)}
                className="sr-only peer"
              />
              <span className="block h-6 w-11 rounded-full bg-slate-700/80 ring-1 ring-inset ring-slate-600/60 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-400"></span>
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-slate-200 shadow-sm transition-transform peer-checked:translate-x-5"></span>
            </label>
          </div>
          </section>

          <div className="mx-auto flex items-center justify-center gap-3">
            <Button
              onClick={spin}
              disabled={!canSpin}
              aria-busy={loading}
              className="rounded-full px-8 py-3 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 shadow-[0_8px_30px_rgb(2,132,199,0.35)] hover:from-blue-400 hover:to-cyan-300 active:scale-[0.98] focus-visible:ring-blue-400 focus-visible:ring-offset-slate-900 ring-offset-2 transition-transform disabled:opacity-60 disabled:saturate-75"
           >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-slate-900"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Spinning…
                </span>
              ) : (
                <span>Spin</span>
              )}
            </Button>
          </div>

          {result && (
            <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-sm w-full mx-auto shadow-[0_8px_30px_rgb(2,6,23,0.35)]">
              {result.question ? (
                <div>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex flex-col items-center gap-2">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                            #{String(result.question.id ?? '—')}
                          </span>
                          <span className="text-lg sm:text-xl font-semibold tracking-tight">{result.question.title}</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-300 flex gap-2 flex-wrap justify-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                        {result.question.difficulty}
                      </span>
                      {result.question.topicTags.map(tt => (
                        <span key={tt} className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700/70">{tt}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button
                        className="rounded-full px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 shadow-[0_8px_30px_rgb(2,132,199,0.35)] hover:from-blue-400 hover:to-cyan-300"
                        onClick={() => window.open(result.link, '_blank')}
                      >
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <div className="text-sm">No question found for these filters.</div>
              )}
              <div className="text-xs text-slate-500 mt-2 px-4 pb-4 text-center">Pool size: {result.count}</div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
