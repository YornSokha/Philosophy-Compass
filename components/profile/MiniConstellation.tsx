"use client";
import { useMemo } from "react";
import type { Philosophy } from "@/lib/types";
import { buildGraphData, filterGraphData } from "@/lib/graph";
import ConstellationGraph from "@/components/graph/ConstellationGraph";

interface Props {
  topIds: string[];
  philosophies: Philosophy[];
}

export default function MiniConstellation({ topIds, philosophies }: Props) {
  const fullData = useMemo(() => buildGraphData(philosophies), [philosophies]);

  const filteredIds = useMemo(() => {
    const ids = new Set(topIds);
    for (const id of topIds) {
      const p = philosophies.find((x) => x.id === id);
      if (p) {
        p.compatible_with.forEach((c) => ids.add(c));
        p.opposes.forEach((c) => ids.add(c));
      }
    }
    return ids;
  }, [topIds, philosophies]);

  const graphData = useMemo(
    () => filterGraphData(fullData, filteredIds),
    [fullData, filteredIds]
  );

  const highlightIds = new Set(topIds);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      <ConstellationGraph
        data={graphData}
        philosophies={philosophies}
        problems={[]}
        mini
        highlightIds={highlightIds}
        height={300}
      />
    </div>
  );
}
