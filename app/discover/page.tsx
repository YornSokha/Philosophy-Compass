import { getQuiz, getAllPhilosophies } from "@/lib/content";
import QuizFlow from "@/components/quiz/QuizFlow";

export default function DiscoverPage() {
  const questions = getQuiz();
  const philosophies = getAllPhilosophies();

  return (
    <main>
      <QuizFlow questions={questions} philosophies={philosophies} />
    </main>
  );
}
