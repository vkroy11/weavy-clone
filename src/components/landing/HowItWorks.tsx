import { MousePointerSquareDashed, Workflow, Play } from "lucide-react";

const STEPS = [
  {
    n: "01",
    Icon: MousePointerSquareDashed,
    title: "Drag nodes onto the canvas",
    body: "Pick from text, image, and LLM nodes in the sidebar. Drop them anywhere — position is yours to keep.",
  },
  {
    n: "02",
    Icon: Workflow,
    title: "Connect them with edges",
    body: "Wire outputs into inputs. The graph captures the dependency order so each node runs with everything it needs.",
  },
  {
    n: "03",
    Icon: Play,
    title: "Run with one click",
    body: "Hit Run. Weavy executes the graph in topological order, calling Gemini or OpenAI and streaming results back into each node.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative px-4 py-20 md:py-28"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="font-display mb-3 text-xs uppercase tracking-[0.3em] text-[--brand-purple-soft]">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="font-display text-3xl font-bold tracking-tight md:text-4xl"
          >
            Three steps from blank canvas to running workflow.
          </h2>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ n, Icon, title, body }) => (
            <li
              key={n}
              className="glass group relative flex flex-col gap-4 rounded-2xl p-6 transition-colors hover:bg-[--surface-strong]"
            >
              <div className="flex items-center justify-between">
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
                <span className="font-display text-xs uppercase tracking-[0.3em] text-[--text-muted]">
                  {n}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-[--text-primary]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[--text-muted]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
