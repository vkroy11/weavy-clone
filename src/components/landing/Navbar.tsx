"use client";

import Link from "next/link";
import { Github, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-4 z-50 mx-4 md:mx-6">
      <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight"
          aria-label="Weavy home"
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-lg bg-[--brand-purple] shadow-[0_0_20px_rgba(124,58,237,0.5)]"
          >
            <span className="font-display text-sm font-bold text-white">W</span>
          </span>
          <span className="font-display">Weavy</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[--text-muted] md:flex">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[--text-primary]"
          >
            How it works
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-[--text-primary]"
          >
            Features
          </a>
          <a
            href="#templates"
            className="transition-colors hover:text-[--text-primary]"
          >
            Templates
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/vkroy11/weavy-clone"
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm text-[--text-muted] transition-colors hover:bg-[--surface] hover:text-[--text-primary] sm:flex"
            aria-label="View on GitHub"
          >
            <Github size={16} aria-hidden="true" />
            GitHub
          </a>
          <Link
            href="/app"
            className="group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[--brand-purple] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9]"
          >
            Launch app
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
