"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  Handle,
  Node,
  Position,
  ReactFlowProvider,
} from "reactflow";
import { Type, Image as ImageIcon, Cpu, Loader2 } from "lucide-react";

/**
 * Connection ports rendered on the demo nodes — mirrors the visible purple
 * dots on the real editor's TextNode/ImageNode/LLMNode handles. Without
 * them, ReactFlow draws floating edges that don't visually anchor to the
 * cards, so the demo doesn't read as a "wired workflow".
 */
const handleClass =
  "!w-2.5 !h-2.5 !bg-[#7c3aed] !border-2 !border-white !shadow";

/**
 * Display-only twins of the real node components, used for the landing-page
 * hero. They share the visual language with the actual editor (white card,
 * grey header, lucide icons, primary-purple accents) but read everything
 * from props so the demo can be driven on a timer without coupling to the
 * Zustand store.
 *
 * The flow rendered here mirrors `landing/testing.json` from the repo: a real
 * 5-node image-to-image chain
 *   product photo + brief    → LLM-A (poster of a woman) ─┐
 *                                                          ├─→ LLM-B (poster of a man)
 *                              tweak prompt ──────────────┘
 * The animation cycles through both LLM stages so visitors see the chain
 * evaluate end-to-end.
 */

type DemoNodeData = {
  active?: boolean;
};

function ShellHeader({
  Icon,
  iconColor,
  title,
}: {
  Icon: typeof Type;
  iconColor: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-t-2xl border-b border-[#e2e8f0] bg-white p-2.5">
      <div className="flex items-center gap-1.5">
        <div className="rounded-md bg-gray-50 p-1">
          <Icon className={iconColor} size={12} aria-hidden="true" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tight text-gray-800">
          {title}
        </span>
      </div>
    </div>
  );
}

function DemoTextNode({
  data,
}: {
  data: DemoNodeData & { value: string; label: string };
}) {
  return (
    <div
      className={`relative w-[200px] overflow-hidden rounded-2xl border-2 bg-white shadow-xl transition-all ${
        data.active ? "demo-node-pulse border-[#22d3ee]" : "border-transparent"
      }`}
    >
      <ShellHeader Icon={Type} iconColor="text-blue-500" title={data.label} />
      <div className="bg-white p-3">
        <div className="line-clamp-3 rounded-lg border border-[#e2e8f0] bg-gray-50 p-2 text-[11px] leading-relaxed text-gray-700">
          {data.value}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={handleClass}
        isConnectable={false}
      />
    </div>
  );
}

function DemoImageNode({
  data,
}: {
  data: DemoNodeData & { src: string; fileName: string };
}) {
  return (
    <div
      className={`relative w-[200px] overflow-hidden rounded-2xl border-2 bg-white shadow-xl transition-all ${
        data.active ? "demo-node-pulse border-[#22d3ee]" : "border-transparent"
      }`}
    >
      <ShellHeader
        Icon={ImageIcon}
        iconColor="text-green-500"
        title="Product Photo"
      />
      <div className="bg-white p-3">
        <div className="relative h-24 w-full overflow-hidden rounded-lg border border-[#e2e8f0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.src}
            alt={data.fileName}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute bottom-1 left-1 max-w-[80%] truncate rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
            {data.fileName}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={handleClass}
        isConnectable={false}
      />
    </div>
  );
}

function DemoLLMNode({
  data,
}: {
  data: DemoNodeData & {
    title: string;
    modelLabel: string;
    output: string | null;
    running: boolean;
  };
}) {
  return (
    <div
      className={`relative w-[240px] overflow-hidden rounded-2xl border-2 bg-white shadow-xl transition-all ${
        data.active ? "demo-node-pulse border-[#22d3ee]" : "border-transparent"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={handleClass}
        isConnectable={false}
      />

      <ShellHeader Icon={Cpu} iconColor="text-purple-500" title={data.title} />
      <div className="space-y-2 bg-white p-3">
        <div className="rounded-lg border border-[#e2e8f0] bg-gray-50 px-2 py-1.5 text-[10px] font-medium text-gray-700">
          {data.modelLabel}
        </div>
        {/*
          The poster outputs are tall portraits (768x1376) — use object-contain
          on a tall enough box so the full poster is visible, not cropped at
          the top/bottom by the previous h-32 + object-cover combo.
        */}
        <div className="flex h-56 items-center justify-center overflow-hidden rounded-lg border border-[#7c3aed]/20 bg-[#7c3aed]/5">
          {data.output ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.output}
              alt={`Generated by ${data.modelLabel}`}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="px-3 text-center text-[10px] italic text-gray-400">
              {data.running ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2
                    size={11}
                    className="animate-spin text-[#7c3aed]"
                    aria-hidden="true"
                  />
                  Generating…
                </span>
              ) : (
                "Output appears here"
              )}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={handleClass}
        isConnectable={false}
      />
    </div>
  );
}

const nodeTypes = {
  demoText: DemoTextNode,
  demoImage: DemoImageNode,
  demoLlm: DemoLLMNode,
};

// Inputs (left column) drawn into LLM-A — then LLM-A's output + a tweak text
// drawn into LLM-B. This is the same shape as `landing/testing.json` but laid
// out in compact left-to-right columns suitable for a 540px-wide hero panel.
// llmA is now ~310px tall (header + label + h-56 poster area), so its bottom
// hits roughly y=400. promptB has to sit below that, otherwise it overlaps the
// LLM card. Pushed promptB down to y=440 to give a clean ~40px gap.
const LAYOUT = {
  source: { x: 0, y: 30 },
  promptA: { x: 0, y: 220 },
  llmA: { x: 240, y: 90 },
  promptB: { x: 240, y: 440 },
  llmB: { x: 510, y: 200 },
} as const;

const PROMPTS = {
  a: "Create an advertisement poster where a person is wearing the headphones, premium e-commerce hero look.",
  b: "Now make the same poster but with a male model. Same lighting, same vibe.",
} as const;

const STAGE = {
  IDLE: 0,
  IN_TO_A: 1,
  A_RUNNING: 2,
  A_DONE: 3,
  IN_TO_B: 4,
  B_RUNNING: 5,
  B_DONE: 6,
} as const;
type Stage = (typeof STAGE)[keyof typeof STAGE];

export function LiveDemo() {
  const [stage, setStage] = useState<Stage>(STAGE.IDLE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      // Reduced-motion users see the final frame statically.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage(STAGE.B_DONE);
      return;
    }

    let cancelled = false;
    // Each entry: how long to dwell, then advance to `next`.
    const sequence: { delay: number; next: Stage }[] = [
      { delay: 600, next: STAGE.IN_TO_A },
      { delay: 700, next: STAGE.A_RUNNING },
      { delay: 1100, next: STAGE.A_DONE },
      { delay: 700, next: STAGE.IN_TO_B },
      { delay: 700, next: STAGE.B_RUNNING },
      { delay: 1100, next: STAGE.B_DONE },
      { delay: 1800, next: STAGE.IDLE },
    ];

    let stepIndex = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = () => {
      if (cancelled) return;
      const step = sequence[stepIndex];
      timer = setTimeout(() => {
        if (cancelled) return;
        setStage(step.next);
        stepIndex = (stepIndex + 1) % sequence.length;
        tick();
      }, step.delay);
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const aHasOutput = stage >= STAGE.A_DONE;
  const aRunning = stage === STAGE.A_RUNNING;
  const bHasOutput = stage >= STAGE.B_DONE;
  const bRunning = stage === STAGE.B_RUNNING;

  const nodes = useMemo<Node[]>(
    () => [
      {
        id: "source",
        type: "demoImage",
        position: LAYOUT.source,
        data: {
          src: "/landing/source-headphones.webp",
          fileName: "download.webp",
          active: stage === STAGE.IN_TO_A,
        },
        draggable: false,
        selectable: false,
      },
      {
        id: "promptA",
        type: "demoText",
        position: LAYOUT.promptA,
        data: {
          label: "Prompt",
          value: PROMPTS.a,
          active: stage === STAGE.IN_TO_A,
        },
        draggable: false,
        selectable: false,
      },
      {
        id: "llmA",
        type: "demoLlm",
        position: LAYOUT.llmA,
        data: {
          title: "Generate Image",
          modelLabel: "Nano Banana 2",
          output: aHasOutput ? "/landing/output-step-1.jpeg" : null,
          running: aRunning,
          active: stage === STAGE.A_RUNNING,
        },
        draggable: false,
        selectable: false,
      },
      {
        id: "promptB",
        type: "demoText",
        position: LAYOUT.promptB,
        data: {
          label: "Tweak",
          value: PROMPTS.b,
          active: stage === STAGE.IN_TO_B,
        },
        draggable: false,
        selectable: false,
      },
      {
        id: "llmB",
        type: "demoLlm",
        position: LAYOUT.llmB,
        data: {
          title: "Refine Image",
          modelLabel: "Nano Banana 2",
          output: bHasOutput ? "/landing/output-step-2.jpeg" : null,
          running: bRunning,
          active: stage === STAGE.B_RUNNING,
        },
        draggable: false,
        selectable: false,
      },
    ],
    [stage, aHasOutput, aRunning, bHasOutput, bRunning],
  );

  // Edges: light grey when idle, cyan + animated dashes when "data is flowing"
  // (i.e. while the downstream node is queued / running) and after the
  // downstream node has produced output we keep them cyan but quiet.
  const edges = useMemo<Edge[]>(() => {
    const aIn = stage >= STAGE.IN_TO_A;
    const bIn = stage >= STAGE.IN_TO_B;
    const cyan = "#22d3ee";
    const grey = "#475569";
    const aActive =
      stage === STAGE.IN_TO_A || stage === STAGE.A_RUNNING;
    const bActive =
      stage === STAGE.IN_TO_B || stage === STAGE.B_RUNNING;
    return [
      {
        id: "e-source-llmA",
        source: "source",
        target: "llmA",
        type: "default",
        animated: aActive,
        style: { stroke: aIn ? cyan : grey, strokeWidth: 2 },
      },
      {
        id: "e-promptA-llmA",
        source: "promptA",
        target: "llmA",
        type: "default",
        animated: aActive,
        style: { stroke: aIn ? cyan : grey, strokeWidth: 2 },
      },
      {
        id: "e-llmA-llmB",
        source: "llmA",
        target: "llmB",
        type: "default",
        animated: bActive,
        style: { stroke: bIn ? cyan : grey, strokeWidth: 2 },
      },
      {
        id: "e-promptB-llmB",
        source: "promptB",
        target: "llmB",
        type: "default",
        animated: bActive,
        style: { stroke: bIn ? cyan : grey, strokeWidth: 2 },
      },
    ];
  }, [stage]);

  return (
    <div
      className="relative h-[620px] w-full overflow-hidden rounded-3xl border border-[--border-strong] bg-[#0f172a] shadow-[0_20px_80px_-20px_rgba(124,58,237,0.5)]"
      role="img"
      aria-label="Animated demo of a Weavy workflow: a product photo and a prompt feed an LLM that generates a poster, then that poster plus a follow-up prompt feed a second LLM that produces a refined version."
    >
      {/* Window-chrome bar to suggest 'this is the editor at /app' */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-1.5 border-b border-white/5 bg-black/20 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 font-display text-[11px] text-[--text-muted]">
          weavy.app/app · headphones-poster
        </span>
      </div>

      <div className="absolute inset-0 pt-9">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1}
              color="#1e293b"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
