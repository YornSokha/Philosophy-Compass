import type { Philosophy } from "./types";

export interface GraphNode {
  id: string;
  name: string;
  tagline: string;
  color: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: "compatible" | "opposes" | "influenced";
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function buildGraphData(philosophies: Philosophy[]): GraphData {
  const nodes: GraphNode[] = philosophies.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    color: p.color,
    val: 3 + p.themes.length * 0.4,
  }));

  const links: GraphLink[] = [];
  const compatSeen = new Set<string>();
  const opposesSeen = new Set<string>();

  for (const p of philosophies) {
    for (const id of p.compatible_with ?? []) {
      const key = [p.id, id].sort().join("|");
      if (!compatSeen.has(key)) {
        compatSeen.add(key);
        links.push({ source: p.id, target: id, type: "compatible" });
      }
    }
    for (const id of p.opposes ?? []) {
      const key = [p.id, id].sort().join("|");
      if (!opposesSeen.has(key)) {
        opposesSeen.add(key);
        links.push({ source: p.id, target: id, type: "opposes" });
      }
    }
    for (const id of p.influenced_by ?? []) {
      links.push({ source: id, target: p.id, type: "influenced" });
    }
  }

  return { nodes, links };
}

export function filterGraphData(data: GraphData, keepIds: Set<string>): GraphData {
  const nodes = data.nodes.filter((n) => keepIds.has(n.id));
  const links = data.links.filter(
    (l) => keepIds.has(l.source as string) && keepIds.has(l.target as string)
  );
  return { nodes, links };
}
