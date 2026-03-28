import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Club, Event } from "../backend";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const STATUSES = ["All", "upcoming", "past", "pending"];

export default function Events() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, refreshProfile } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [regLoading, setRegLoading] = useState<string | null>(null);

  const isLoggedIn = !!(
    identity &&
    !identity.getPrincipal().isAnonymous() &&
    profile
  );

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getAllEvents(), actor.getAllClubs()])
      .then(([evs, cls]) => {
        setEvents(evs);
        setClubs(cls);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  const clubMap = Object.fromEntries(clubs.map((c) => [String(c.id), c.name]));
  const regIds = new Set((profile?.registeredEvents || []).map(String));

  const filtered = events.filter((e) => {
    const matchStatus = status === "All" || e.status === status;
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleRegister = async (eventId: bigint) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setRegLoading(String(eventId));
    try {
      await actor!.registerForEvent(eventId);
      await refreshProfile();
      toast.success("Registered for event!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setRegLoading(null);
    }
  };
  const handleUnregister = async (eventId: bigint) => {
    setRegLoading(String(eventId));
    try {
      await actor!.unregisterFromEvent(eventId);
      await refreshProfile();
      toast.success("Unregistered");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setRegLoading(null);
    }
  };

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#111827" }}>
          Events
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="flex-1 px-4 py-2 rounded-full border text-sm"
            style={{ borderColor: "#E6EEF5", background: "#fff" }}
          />
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize"
                style={
                  status === s
                    ? { background: "#2F6FDE", color: "#fff" }
                    : {
                        background: "#fff",
                        color: "#6B7280",
                        border: "1px solid #E6EEF5",
                      }
                }
              >
                {s}
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
            No events found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((ev) => (
              <EventCard
                key={String(ev.id)}
                event={ev}
                clubName={clubMap[String(ev.clubId)]}
                isRegistered={regIds.has(String(ev.id))}
                onRegister={() => handleRegister(ev.id)}
                onUnregister={() => handleUnregister(ev.id)}
                loading={regLoading === String(ev.id)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
