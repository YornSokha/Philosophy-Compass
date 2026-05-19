import { getAllPhilosophies, getAllProblems } from "@/lib/content";
import { buildGraphData } from "@/lib/graph";
import ConstellationGraph from "@/components/graph/ConstellationGraph";

export default function HomePage() {
  const philosophies = getAllPhilosophies();
  const problems = getAllProblems();
  const graphData = buildGraphData(philosophies);

  return (
    <main className="w-full overflow-hidden" style={{ height: "100dvh" }}>
      <ConstellationGraph
        data={graphData}
        philosophies={philosophies}
        problems={problems}
      />
    </main>
  );
}
