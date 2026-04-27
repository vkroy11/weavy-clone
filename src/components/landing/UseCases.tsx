import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Wand2, Image as ImageIcon } from "lucide-react";
import { PRODUCT_LISTING_GENERATOR } from "@/lib/prebuiltWorkflows";

type CaseCard = {
  Icon: typeof Sparkles;
  title: string;
  blurb: string;
  ctaHref?: string;
  ctaLabel?: string;
  status: "live" | "soon";
  inputs: string[];
  output: string;
};

const productListingCard: CaseCard = {
  Icon: Sparkles,
  title: "Product Listing Generator",
  blurb:
    "Drop a product photo and a one-line description. Get back a structured eBay-style listing with a title, key features, and a persuasive description.",
  ctaHref: "/app?template=product-listing",
  ctaLabel: "Use template",
  status: "live",
  inputs: PRODUCT_LISTING_GENERATOR.nodes
    .filter((n) => n.type !== "llmNode")
    .map((n) => n.data?.label ?? n.type),
  output: "eBay listing copy",
};

const CARDS: CaseCard[] = [
  productListingCard,
  {
    Icon: FileText,
    title: "Long-form blog draft",
    blurb:
      "Outline-to-draft pipeline: feed in a topic and reference links, branch into section nodes, merge into a final draft.",
    status: "soon",
    inputs: ["Topic", "References", "Style guide"],
    output: "Blog markdown",
  },
  {
    Icon: Wand2,
    title: "Image style transfer",
    blurb:
      "Upload a source image and a style reference, then chain through a generation node to produce stylised variants.",
    status: "soon",
    inputs: ["Source image", "Style reference"],
    output: "Stylised renders",
  },
];

export function UseCases() {
  return (
    <section
      id="templates"
      className="relative px-4 py-20 md:py-28"
      aria-labelledby="templates-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-display mb-3 text-xs uppercase tracking-[0.3em] text-[--brand-purple-soft]">
              Templates
            </p>
            <h2
              id="templates-heading"
              className="font-display text-3xl font-bold tracking-tight md:text-4xl"
            >
              Start from a working graph, not an empty canvas.
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CARDS.map(
            ({ Icon, title, blurb, ctaHref, ctaLabel, status, inputs, output }) => (
              <article
                key={title}
                className="glass relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 transition-colors hover:bg-[--surface-strong]"
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
                  <span
                    className={`font-display rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      status === "live"
                        ? "bg-[--brand-purple]/15 text-[--brand-purple-soft]"
                        : "bg-[--surface] text-[--text-muted]"
                    }`}
                  >
                    {status === "live" ? "Available" : "Coming soon"}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold text-[--text-primary]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[--text-muted]">
                  {blurb}
                </p>

                <div className="mt-2 space-y-2 border-t border-[--border-subtle] pt-4">
                  <div className="flex items-start gap-3 text-xs">
                    <span className="font-display mt-0.5 w-12 shrink-0 uppercase tracking-widest text-[--text-muted]">
                      Inputs
                    </span>
                    <ul className="flex flex-wrap gap-1.5">
                      {inputs.map((i) => (
                        <li
                          key={i}
                          className="rounded-md border border-[--border-subtle] bg-[--surface] px-2 py-0.5 text-[--text-primary]"
                        >
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-start gap-3 text-xs">
                    <span className="font-display mt-0.5 w-12 shrink-0 uppercase tracking-widest text-[--text-muted]">
                      Output
                    </span>
                    <span className="rounded-md border border-[--border-subtle] bg-[--surface] px-2 py-0.5 text-[--text-primary]">
                      {output}
                    </span>
                  </div>
                </div>

                {status === "live" && ctaHref && ctaLabel ? (
                  <Link
                    href={ctaHref}
                    className="group mt-2 inline-flex cursor-pointer items-center gap-1.5 self-start text-sm font-semibold text-[--brand-purple-soft] transition-colors hover:text-white"
                  >
                    {ctaLabel}
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ) : (
                  <span className="mt-2 inline-flex items-center gap-1.5 self-start text-sm text-[--text-muted]">
                    <ImageIcon size={14} aria-hidden="true" />
                    On the roadmap
                  </span>
                )}
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
