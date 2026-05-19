import { Suspense } from "react";
import { getAllPhilosophies } from "@/lib/content";
import ProfileView from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const philosophies = getAllPhilosophies();

  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)] text-sm">
            Loading…
          </div>
        }
      >
        <ProfileView philosophies={philosophies} />
      </Suspense>
    </main>
  );
}
