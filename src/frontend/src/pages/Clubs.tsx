import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Club } from "../backend";
import ClubCard from "../components/ClubCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CATEGORIES = [
  "All",
  "Tech",
  "Sports",
  "Arts",
  "Cultural",
  "Science",
  "Music",
];

export default function Clubs() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, refreshProfile } = useApp();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [loadingJoin, setLoadingJoin] = useState<string | null>(null);

  const isLoggedIn = !!(
    identity &&
    !identity.getPrincipal().isAnonymous() &&
    profile
  );

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getAllClubs()
      .then(setClubs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  const filtered = clubs.filter((c) => {
    const matchCat = cat === "All" || c.category === cat;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const joinedIds = new Set((profile?.joinedClubs || []).map(String));

  const handleJoin = async (clubId: bigint) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setLoadingJoin(String(clubId));
    try {
      await actor!.joinClub(clubId);
      await refreshProfile();
      toast.success("Joined club!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setLoadingJoin(null);
    }
  };
  const handleLeave = async (clubId: bigint) => {
    setLoadingJoin(String(clubId));
    try {
      await actor!.leaveClub(clubId);
      await refreshProfile();
      toast.success("Left club");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingJoin(null);
    }
  };

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#111827" }}>
          All Clubs
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs…"
            className="flex-1 px-4 py-2 rounded-full border text-sm"
            style={{ borderColor: "#E6EEF5", background: "#fff" }}
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCat(c)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={
                  cat === c
                    ? { background: "#2F6FDE", color: "#fff" }
                    : {
                        background: "#fff",
                        color: "#6B7280",
                        border: "1px solid #E6EEF5",
                      }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-64 animate-pulse"
                style={{ border: "1px solid #E6EEF5" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16" style={{ color: "#6B7280" }}>
            No clubs found. Try a different search or category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((club) => (
              <ClubCard
                key={String(club.id)}
                club={club}
                isJoined={joinedIds.has(String(club.id))}
                onJoin={() => handleJoin(club.id)}
                onLeave={() => handleLeave(club.id)}
                loading={loadingJoin === String(club.id)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
