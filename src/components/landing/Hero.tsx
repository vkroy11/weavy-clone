"use client";

import Link from "next/link";
import { ArrowRight, Github, Sparkles } from "lucide-react";
import { LiveDemo } from "./LiveDemo";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 md:pb-24 md:pt-20">
      {/* Background ornaments */}
      <div
        aria-hidden="true"
        className="grid-bg grid-bg-animated pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="glow-purple pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2"
      />
      <div
        aria-hidden="true"
        className="glow-cyan pointer-events-none absolute -right-40 top-40 h-[400px] w-[400px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-[--text-muted]">
            <Sparkles
              size={12}
              className="text-[--brand-purple-soft]"
              aria-hidden="true"
            />
            <span>Visual canvas for AI workflows</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            <span className="gradient-text">Drag nodes.</span>
            <br />
            <span className="gradient-text">Connect them.</span>
            <br />
            <span className="text-[--text-primary]">Run with AI.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[--text-muted] md:text-lg">
            Weavy is a node-based editor for building AI workflows. Compose text
            and image inputs, wire them into Gemini or OpenAI, and run them — no
            backend code, no glue scripts.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[--brand-purple] px-5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(124,58,237,0.7)] transition-colors hover:bg-[#6d28d9]"
            >
              Launch the canvas
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="https://github.com/vkroy11/weavy-clone"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[--border-strong] bg-[--surface] px-5 text-sm font-semibold text-[--text-primary] transition-colors hover:bg-[--surface-strong]"
            >
              <Github size={16} aria-hidden="true" />
              View source
            </a>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[--border-subtle] pt-6">
            <div>
              <dt className="text-xs uppercase tracking-widest text-[--text-muted]">
                Models
              </dt>
              <dd className="font-display mt-1 text-lg font-semibold text-[--text-primary]">
                5+
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-[--text-muted]">
                Setup
              </dt>
              <dd className="font-display mt-1 text-lg font-semibold text-[--text-primary]">
                ~60s
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-[--text-muted]">
                License
              </dt>
              <dd className="font-display mt-1 text-lg font-semibold text-[--text-primary]">
                MIT
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <LiveDemo />
        </div>
      </div>
    </section>
  );
}
