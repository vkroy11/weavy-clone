import {
  Layers3,
  KeyRound,
  Database,
  LayoutTemplate,
  GitBranch,
  Sparkles,
} from "lucide-react";
import { MODEL_REGISTRY } from "@/lib/models";

const modelChips = MODEL_REGISTRY.map((m) => m.name);

const FEATURES = [
  {
    Icon: Layers3,
    title: "Visual canvas, not config files",
    body: "ReactFlow-powered editor with undo/redo, JSON import/export, and a sidebar of pre-built node types.",
    span: "md:col-span-2",
  },
  {
    Icon: GitBranch,
    title: "Multi-model out of the box",
    body: "Mix Google and OpenAI models in the same graph. Swap providers per node without rewiring.",
    span: "md:col-span-1",
    chips: modelChips,
  },
  {
    Icon: KeyRound,
    title: "Bring your own keys",
    body: "No free tier, no proxy. Paste a Gemini or OpenAI key once — it lives in your browser and goes straight to the provider.",
    span: "md:col-span-1",
  },
  {
    Icon: Database,
    title: "Save and reload workflows",
    body: "Persist graphs to your own database via Prisma — your data stays on your infra.",
    span: "md:col-span-1",
  },
  {
    Icon: LayoutTemplate,
    title: "Templates to start from",
    body: "Skip the blank canvas. Start with prebuilt graphs like the Product Listing Generator.",
    span: "md:col-span-1",
  },
  {
    Icon: Sparkles,
    title: "Open source",
    body: "MIT licensed. Fork it, run it locally, or self-host on your own infra.",
    span: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative px-4 py-20 md:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="font-display mb-3 text-xs uppercase tracking-[0.3em] text-[--brand-purple-soft]">
            What you get
          </p>
          <h2
            id="features-heading"
            className="font-display text-3xl font-bold tracking-tight md:text-4xl"
          >
            A canvas, the model registry, and the pipes between them.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, body, span, chips }) => (
            <article
              key={title}
              className={`glass group flex flex-col gap-3 rounded-2xl p-6 transition-colors hover:bg-[--surface-strong] ${span}`}
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-xl border border-[--border-strong] bg-[--surface]"
              >
                <Icon
                  size={18}
                  className="text-[--brand-purple-soft]"
                  aria-hidden="true"
                />
              </span>
              <h3 className="font-display text-lg font-semibold text-[--text-primary]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[--text-muted]">
                {body}
              </p>
              {chips && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <li
                      key={c}
                      className="font-display rounded-md border border-[--border-subtle] bg-[--surface] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[--text-muted]"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
