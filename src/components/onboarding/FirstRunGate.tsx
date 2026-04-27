"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import {
  useApiTokenStore,
  useApiTokensHydrated,
} from "@/store/useApiTokenStore";
import type { Provider } from "@/lib/models";

const PROVIDERS: {
  id: Provider;
  label: string;
  placeholder: string;
  helpUrl: string;
  helpLabel: string;
}[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    placeholder: "AIzaSy...",
    helpUrl: "https://aistudio.google.com/app/apikey",
    helpLabel: "Get a Gemini key",
  },
  {
    id: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
    helpLabel: "Get an OpenAI key",
  },
];

/**
 * Blocks the workflow editor until the user saves at least one provider API
 * key. Weavy is strictly bring-your-own-key — there is no system-level key,
 * no free tier, and no proxy. Saved keys live only in this browser's
 * localStorage.
 */
export function FirstRunGate({ children }: { children: ReactNode }) {
  const hydrated = useApiTokensHydrated();
  const tokens = useApiTokenStore((s) => s.tokens);
  const setToken = useApiTokenStore((s) => s.setToken);
  const [drafts, setDrafts] = useState<Partial<Record<Provider, string>>>({});

  // Avoid a flash of the gate for users who already have a key. Render
  // nothing until the persisted store has rehydrated from localStorage.
  if (!hydrated) {
    return (
      <div
        aria-hidden="true"
        className="grid h-screen w-screen place-items-center bg-canvas"
      />
    );
  }

  const hasAnyKey = !!tokens.gemini || !!tokens.openai;
  if (hasAnyKey) return <>{children}</>;

  const handleSave = (provider: Provider) => {
    const value = drafts[provider]?.trim();
    if (!value) return;
    setToken(provider, value);
    setDrafts((d) => ({ ...d, [provider]: "" }));
  };

  return (
    <div className="grid min-h-screen w-screen place-items-center bg-gradient-to-br from-[#0a0a0f] via-[#13131c] to-[#0a0a0f] p-6 text-[#f8fafc]">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_-30px_rgba(124,58,237,0.6)] backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#94a3b8] transition-colors hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to home
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-[#a78bfa]">
            <Sparkles size={11} aria-hidden="true" />
            Setup &middot; 1 step
          </span>
        </div>

        <div className="mb-6 inline-grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#7c3aed]/15">
          <KeyRound size={20} className="text-[#a78bfa]" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Add a model key to start
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#94a3b8] md:text-base">
          Weavy runs your workflows directly against the model provider you
          choose. Paste a Gemini or OpenAI key to unlock the canvas. You only
          need one to begin — you can add the other later from Settings.
        </p>

        <div className="mt-8 space-y-5">
          {PROVIDERS.map((p) => {
            const saved = !!tokens[p.id];
            return (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`key-${p.id}`}
                    className="text-sm font-semibold text-white"
                  >
                    {p.label}
                  </label>
                  <a
                    href={p.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer text-xs text-[#a78bfa] transition-colors hover:text-white"
                  >
                    {p.helpLabel} &rarr;
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={`key-${p.id}`}
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={p.placeholder}
                    value={drafts[p.id] || ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSave(p.id)}
                    disabled={saved}
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-sm text-white placeholder:text-[#475569] focus:border-[#7c3aed]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(p.id)}
                    disabled={!drafts[p.id]?.trim() || saved}
                    className="inline-flex h-12 cursor-pointer items-center gap-1.5 rounded-xl bg-[#7c3aed] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Check size={16} aria-hidden="true" />
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-[#94a3b8]">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-[#22d3ee]"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-white">
              Your key stays in this browser
            </p>
            <p className="mt-1">
              Saved to localStorage on this device only. Weavy&rsquo;s server
              forwards each request to the model provider you chose &mdash;
              nothing else logs or stores your key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
