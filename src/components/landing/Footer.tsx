import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl px-6 py-12 text-center">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-lg bg-[--brand-purple] shadow-[0_0_20px_rgba(124,58,237,0.5)]"
            >
              <span className="font-display text-sm font-bold text-white">W</span>
            </span>
            <span className="font-display text-lg font-bold">Weavy</span>
          </div>
          <h2 className="font-display max-w-xl text-2xl font-bold tracking-tight md:text-3xl">
            Open the canvas. Wire something up.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
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
              GitHub
            </a>
          </div>
          <p className="text-xs text-[--text-muted]">
            MIT licensed · Built with Next.js, ReactFlow, Gemini, and OpenAI.
          </p>
        </div>
      </div>
    </footer>
  );
}
