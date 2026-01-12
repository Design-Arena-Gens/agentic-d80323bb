'use client';

import { useMemo, useState } from "react";

type Preset = {
  id: string;
  label: string;
  description: string;
  transform: (value: string) => string;
};

const presets: Preset[] = [
  {
    id: "clean-underscore",
    label: "Clean underscore",
    description: "Lowercase words separated by single underscores.",
    transform: (value: string) =>
      value
        .trim()
        .toLocaleLowerCase()
        .replace(/[^a-z0-9\s_-]+/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, ""),
  },
  {
    id: "kept-case",
    label: "Keep casing",
    description: "Preserves casing while merging spaces into underscores.",
    transform: (value: string) =>
      value
        .trim()
        .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_"),
  },
  {
    id: "screaming",
    label: "Screaming snake",
    description: "Uppercase characters with underscores between words.",
    transform: (value: string) =>
      value
        .trim()
        .toLocaleUpperCase()
        .replace(/[^A-Z0-9\s_-]+/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, ""),
  },
];

function buildPreview(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      pieces: [],
      issues: ["Waiting for input…"],
    };
  }

  const tokens = trimmed.split(/\s+/);
  const issues: string[] = [];

  if (/\s{2,}/.test(value)) {
    issues.push("Detected extra spaces. They will be collapsed.");
  }
  if (/[^a-z0-9\s_-]/i.test(value)) {
    issues.push("Special characters will be removed.");
  }

  return {
    pieces: tokens,
    issues,
  };
}

export default function Home() {
  const [name, setName] = useState("");
  const [activePreset, setActivePreset] = useState<Preset["id"]>("clean-underscore");

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === activePreset) ?? presets[0],
    [activePreset]
  );

  const transformed = useMemo(() => selectedPreset.transform(name), [name, selectedPreset]);
  const preview = useMemo(() => buildPreview(name), [name]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 pb-24 pt-20">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <h1 className="text-4xl font-semibold tracking-tight">Naming Agent</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-200/80">
            Paste any human-readable name and instantly receive a filesystem-safe underscore variant.
            Switch presets to match your project conventions and copy the result in one click.
          </p>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="space-y-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium uppercase tracking-wider text-slate-300/80">
                Source name
              </span>
              <textarea
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Quarterly Revenue Report 2024"
                className="min-h-[180px] rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-base text-slate-100 shadow-inner shadow-black/30 outline-none transition focus:border-blue-400/80 focus:ring-2 focus:ring-blue-400/20"
              />
            </label>

            <div className="space-y-3">
              <span className="text-sm font-medium uppercase tracking-wider text-slate-300/80">
                Presets
              </span>
              <div className="grid gap-3 md:grid-cols-3">
                {presets.map((preset) => {
                  const isActive = preset.id === selectedPreset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePreset(preset.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-blue-400/70 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                          : "border-white/10 bg-white/5 hover:border-blue-300/50 hover:bg-blue-500/10"
                      }`}
                    >
                      <div className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                        {preset.label}
                      </div>
                      <p className="mt-1 text-sm text-slate-300/80">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40">
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-slate-300/80">
                Generated file name
              </span>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <code className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-base text-blue-100">
                  {transformed || "waiting_for_input"}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(transformed || "waiting_for_input")}
                  className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-blue-100 transition hover:border-blue-200/80 hover:bg-blue-400/20"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-slate-300/80">
                Token preview
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {preview.pieces.length ? (
                  preview.pieces.map((piece, index) => (
                    <span
                      key={`${piece}-${index}`}
                      className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-1 text-sm text-slate-100"
                    >
                      {piece}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400/80">No tokens yet.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium uppercase tracking-wider text-slate-300/80">
                Agent notes
              </span>
              <ul className="space-y-2 text-sm text-slate-300/80">
                {preview.issues.map((issue, index) => (
                  <li key={`${issue}-${index}`} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <span>{issue}</span>
                  </li>
                ))}
                {!preview.issues.length && (
                  <li className="flex items-start gap-2 text-blue-200">
                    <span className="mt-1 h-2 w-2 rounded-full bg-green-400" />
                    <span>Input looks clean—ready for file naming.</span>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
