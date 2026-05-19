"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GraphData, GraphNode } from "@/lib/graph";
import type { Philosophy, Problem } from "@/lib/types";
import PhilosophyPanel from "./PhilosophyPanel";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
      Loading constellation…
    </div>
  ),
});

interface Props {
  data: GraphData;
  philosophies: Philosophy[];
  problems: Problem[];
  mini?: boolean;
  highlightIds?: Set<string>;
  height?: number;
}

export default function ConstellationGraph({
  data,
  philosophies,
  problems,
  mini = false,
  highlightIds: externalHighlight,
  height,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const lastClick = useRef({ time: 0, id: "" });

  // Escape key closes panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const highlightIds: Set<string> | null = (() => {
    if (externalHighlight) return externalHighlight;
    if (filter === "all") return null;
    if (filter.startsWith("problem:")) {
      const pid = filter.slice(8);
      const phil = philosophies.filter((p) => p.problems_helped.includes(pid));
      return new Set(phil.map((p) => p.id));
    }
    if (filter.startsWith("theme:")) {
      const theme = filter.slice(6);
      const phil = philosophies.filter((p) => p.themes.includes(theme));
      return new Set(phil.map((p) => p.id));
    }
    return null;
  })();

  // Connected nodes for hover highlight
  const connectedIds = useMemo(() => {
    if (!hovered) return null;
    const ids = new Set<string>([hovered]);
    for (const l of data.links) {
      const src = ((l.source as { id?: string }).id ?? l.source) as string;
      const tgt = ((l.target as { id?: string }).id ?? l.target) as string;
      if (src === hovered) ids.add(tgt);
      if (tgt === hovered) ids.add(src);
    }
    return ids;
  }, [hovered, data.links]);

  // Hover takes priority over filter for dimming
  const effectiveHighlight = hovered ? connectedIds : highlightIds;

  const nodeCanvasObject = useCallback(
    (node: Record<string, unknown>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = node.id as string;
      const x = node.x as number;
      const y = node.y as number;
      const color = node.color as string;
      const val = (node.val as number) ?? 3;
      const name = node.name as string;

      const isDimmed = effectiveHighlight !== null && !effectiveHighlight.has(id);
      const isSelected = selected?.id === id;
      const isHovered = hovered === id;
      const r = val * 4;
      const alpha = isDimmed ? 0.12 : 1;

      if ((isSelected || isHovered) && !isDimmed) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = isSelected ? 20 : 12;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color + "33";
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color + Math.round(alpha * (isSelected ? 255 : 180)).toString(16).padStart(2, "0");
      ctx.fill();

      if (isSelected && !isDimmed) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      if (!isDimmed && (globalScale > 0.5 || isHovered || isSelected)) {
        const fs = Math.max(10, 13 / globalScale);
        ctx.font = `${fs}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = isDimmed ? "rgba(205,216,238,0.15)" : "#cdd8ee";
        ctx.fillText(name, x, y + r + fs * 1.2);
      }
    },
    [selected, hovered, effectiveHighlight]
  );

  const linkCanvasObject = useCallback(
    (link: Record<string, unknown>, ctx: CanvasRenderingContext2D) => {
      const s = link.source as { x?: number; y?: number; id?: string };
      const t = link.target as { x?: number; y?: number; id?: string };
      if (!s.x || !t.x) return;

      const type = link.type as string;
      const sDimmed = effectiveHighlight !== null && s.id && !effectiveHighlight.has(s.id);
      const tDimmed = effectiveHighlight !== null && t.id && !effectiveHighlight.has(t.id);
      const dimmed = sDimmed || tDimmed;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y!);
      ctx.lineTo(t.x, t.y!);

      if (type === "compatible") {
        ctx.strokeStyle = dimmed ? "rgba(120,160,220,0.05)" : "rgba(120,160,220,0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
      } else if (type === "opposes") {
        ctx.strokeStyle = dimmed ? "rgba(200,80,80,0.05)" : "rgba(200,80,80,0.25)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = dimmed ? "rgba(180,180,220,0.04)" : "rgba(180,180,220,0.18)";
        ctx.lineWidth = 0.7;
        ctx.setLineDash([4, 5]);
      }

      ctx.stroke();
      ctx.setLineDash([]);
    },
    [effectiveHighlight]
  );

  const allThemes = [...new Set(philosophies.flatMap((p) => p.themes))].slice(0, 8);

  return (
    <div className="relative w-full" style={{ height: height ?? "100dvh" }}>
      {!mini && (
        <div className="absolute top-16 left-0 right-0 z-10 px-6 pt-4 pointer-events-none">
          <div className="pointer-events-auto flex gap-2 overflow-x-auto md:flex-wrap pb-1 scrollbar-hide">
            <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
            {problems.slice(0, 5).map((p) => (
              <FilterChip
                key={p.id}
                label={p.name}
                active={filter === `problem:${p.id}`}
                onClick={() => setFilter(filter === `problem:${p.id}` ? "all" : `problem:${p.id}`)}
              />
            ))}
            {allThemes.slice(0, 4).map((t) => (
              <FilterChip
                key={t}
                label={t}
                active={filter === `theme:${t}`}
                onClick={() => setFilter(filter === `theme:${t}` ? "all" : `theme:${t}`)}
                variant="theme"
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full h-full">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ForceGraph2D
          graphData={data as any}
          nodeCanvasObject={nodeCanvasObject as any}
          nodeCanvasObjectMode={() => "replace"}
          linkCanvasObject={linkCanvasObject as any}
          linkCanvasObjectMode={() => "replace"}
          onNodeClick={(node: any) => {
            const now = Date.now();
            const id = node.id as string;
            if (now - lastClick.current.time < 300 && lastClick.current.id === id) {
              router.push(`/philosophies/${id}`);
            } else {
              setSelected(selected?.id === id ? null : (node as GraphNode));
            }
            lastClick.current = { time: now, id };
          }}
          onNodeHover={(node: any) => setHovered(node ? (node as GraphNode).id : null)}
          onBackgroundClick={() => setSelected(null)}
          backgroundColor="transparent"
          linkDirectionalArrowLength={(l: any) => (l.type === "influenced" ? 5 : 0)}
          linkDirectionalArrowRelPos={1}
          cooldownTicks={mini ? 50 : 120}
          warmupTicks={mini ? 20 : 60}
          d3AlphaDecay={0.04}
          d3VelocityDecay={0.25}
          enableZoomInteraction={!mini}
          enablePanInteraction={!mini}
          nodeRelSize={1}
        />
      </div>

      {!mini && selected && (
        <PhilosophyPanel
          node={selected}
          philosophies={philosophies}
          onClose={() => setSelected(null)}
        />
      )}

      {!mini && (
        <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 text-xs text-[var(--text-faint)]">
          <LegendItem color="rgba(120,160,220,0.6)" dash={false} label="Compatible" />
          <LegendItem color="rgba(200,80,80,0.5)" dash={false} label="Opposes" />
          <LegendItem color="rgba(180,180,220,0.4)" dash label="Influences" />
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  variant = "problem",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "problem" | "theme";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all border ${
        active
          ? "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border)]"
      } ${variant === "theme" ? "italic" : ""}`}
    >
      {label}
    </button>
  );
}

function LegendItem({
  color,
  dash,
  label,
}: {
  color: string;
  dash: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="2" className="flex-shrink-0">
        {dash ? (
          <line x1="0" y1="1" x2="24" y2="1" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
        ) : (
          <line x1="0" y1="1" x2="24" y2="1" stroke={color} strokeWidth="1.5" />
        )}
      </svg>
      <span>{label}</span>
    </div>
  );
}
