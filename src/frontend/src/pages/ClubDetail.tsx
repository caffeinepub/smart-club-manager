import { Calendar, ChevronLeft, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Club, Event } from "../backend";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function ClubDetail({ id }: { id: string }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, refreshProfile } = useApp();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [regLoading, setRegLoading] = useState<string | null>(null);

  const isLoggedIn = !!(
    identity &&
    !identity.getPrincipal().isAnonymous() &&
    profile
  );
  const isJoined = profile?.joinedClubs.some((c) => String(c) === id) ?? false;
  const regIds = new Set((profile?.registeredEvents || []).map(String));

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getClub(BigInt(id)), actor.getClubEvents(BigInt(id))])
      .then(([c, evs]) => {
        setClub(c);
        setEvents(evs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, id]);

  const handleJoin = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setJoining(true);
    try {
      await (isJoined
        ? actor!.leaveClub(BigInt(id))
        : actor!.joinClub(BigInt(id)));
      await refreshProfile();
      toast.success(isJoined ? "Left club" : "Joined club!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setJoining(false);
    }
  };
  const handleRegister = async (eventId: bigint) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setRegLoading(String(eventId));
    try {
      await actor!.registerForEvent(eventId);
      await refreshProfile();
      toast.success("Registered!");
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

  if (loading)
    return (
      <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse bg-white rounded-xl h-64" />
        </div>
      </div>
    );
  if (!club)
    return (
      <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p style={{ color: "#6B7280" }}>Club not found.</p>
        </div>
      </div>
    );

  const imgUrl =
    club.imageUrl ||
    `https://picsum.photos/seed/${encodeURIComponent(club.name)}/800/300`;

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate("/clubs")}
          className="flex items-center gap-1 text-sm mb-4"
          style={{ color: "#6B7280" }}
        >
          <ChevronLeft size={16} /> Back to Clubs
        </button>
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: "1px solid #E6EEF5" }}
        >
          <div className="relative">
            <img
              src={imgUrl}
              alt={club.name}
              className="w-full h-56 object-cover"
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-6"
              style={{
                background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
              }}
            >
              <span
                className="text-xs text-white px-2 py-0.5 rounded-full w-fit mb-2"
                style={{ background: "#2F6FDE" }}
              >
                {club.category}
              </span>
              <h1 className="text-2xl font-bold text-white">{club.name}</h1>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: "#6B7280" }}
              >
                <Users size={14} /> {Number(club.memberCount)} members
              </span>
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: "#6B7280" }}
              >
                <Calendar size={14} /> Since{" "}
                {new Date(
                  Number(club.createdAt) / 1_000_000,
                ).toLocaleDateString()}
              </span>
            </div>
            <p className="mb-4" style={{ color: "#374151" }}>
              {club.description}
            </p>
            <Button
              onClick={handleJoin}
              disabled={joining}
              style={
                isJoined
                  ? { borderColor: "#E6EEF5", color: "#6B7280" }
                  : { background: "#2F6FDE", color: "#fff" }
              }
              variant={isJoined ? "outline" : "default"}
            >
              {joining ? "…" : isJoined ? "Leave Club" : "Join Club"}
            </Button>
          </div>
        </div>

        {/* Club Events */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#111827" }}>
            Club Events
          </h2>
          {events.length === 0 ? (
            <p className="text-center py-8" style={{ color: "#6B7280" }}>
              No events for this club yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {events.map((ev) => (
                <EventCard
                  key={String(ev.id)}
                  event={ev}
                  clubName={club.name}
                  isRegistered={regIds.has(String(ev.id))}
                  onRegister={() => handleRegister(ev.id)}
                  onUnregister={() => handleUnregister(ev.id)}
                  loading={regLoading === String(ev.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
