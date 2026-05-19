"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Philosophy, BlendProfile } from "@/lib/types";
import { decodeProfile } from "@/lib/scoring";
import { useProfileStore } from "@/lib/store";
import BlendBar from "./BlendBar";
import TensionCallout from "./TensionCallout";
import MiniConstellation from "./MiniConstellation";

interface Props {
  philosophies: Philosophy[];
}

export default function ProfileView({ philosophies }: Props) {
  const searchParams = useSearchParams();
  const { current } = useProfileStore();
  const [profile, setProfile] = useState<BlendProfile | null>(null);

  useEffect(() => {
    const encoded = searchParams.get("blend");
    if (encoded) {
      const decoded = decodeProfile(encoded);
      if (decoded) { setProfile(decoded); return; }
    }
    if (current) setProfile(current);
  }, [searchParams, current]);

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-serif text-2xl text-[var(--text-muted)]">No blend profile yet.</p>
        <Link
          href="/discover"
          className="px-8 py-3 rounded-full bg-[var(--text)] text-[var(--bg)] text-sm hover:opacity-90 transition-opacity"
        >
          Take the quiz →
        </Link>
      </div>
    );
  }

  const topPhils = profile.top
    .map((id) => philosophies.find((p) => p.id === id))
    .filter(Boolean) as Philosophy[];

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile?blend=${searchParams.get("blend") ?? ""}`
      : "";

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-widest mb-3">
            Your philosophical blend
          </p>
          <h1 className="font-serif text-4xl text-[var(--text)]">
            {topPhils.map((p) => p.name).join(" · ")}
          </h1>
          <p className="text-[var(--text-muted)] mt-3 text-sm">
            {topPhils[0]?.tagline}
          </p>
        </motion.div>

        <section>
          <BlendBar scores={profile.scores} philosophies={philosophies} />
        </section>

        {profile.top.length >= 2 && (
          <section>
            <MiniConstellation topIds={profile.top} philosophies={philosophies} />
          </section>
        )}

        {profile.tensions.length > 0 && (
          <section>
            <TensionCallout tensions={profile.tensions} philosophies={philosophies} />
          </section>
        )}

        <section className="flex flex-col gap-4">
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider">
            Your primary philosophies
          </p>
          {topPhils.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex gap-4"
            >
              <div
                className="w-1 rounded-full flex-shrink-0"
                style={{ background: p.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg text-[var(--text)]">{p.name}</h3>
                  <Link
                    href={`/philosophies/${p.id}`}
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors flex-shrink-0"
                  >
                    Explore →
                  </Link>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{p.summary}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="flex flex-col gap-3 pt-4 border-t border-[var(--border)]">
          <div className="flex gap-3">
            <Link
              href="/discover"
              className="flex-1 py-2.5 text-center text-sm rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-faint)] transition-all"
            >
              Retake quiz
            </Link>
            {shareUrl && (
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "My Philosophy Blend", url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link copied!");
                  }
                }}
                className="flex-1 py-2.5 text-center text-sm rounded-full bg-[var(--surface-2)] text-[var(--text)] hover:opacity-80 transition-opacity"
              >
                Share blend
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
