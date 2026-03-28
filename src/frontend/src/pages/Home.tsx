import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Club, Event } from "../backend";
import { EventStatus } from "../backend";
import ClubCard from "../components/ClubCard";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Home() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, refreshProfile } = useApp();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingJoin, setLoadingJoin] = useState<string | null>(null);
  const [loadingReg, setLoadingReg] = useState<string | null>(null);

  const isLoggedIn = !!(
    identity &&
    !identity.getPrincipal().isAnonymous() &&
    profile
  );

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllClubs()
      .then(setClubs)
      .catch(() => {});
    actor
      .getAllEvents()
      .then((evs) =>
        setEvents(evs.filter((e) => e.status === EventStatus.upcoming)),
      )
      .catch(() => {});
  }, [actor]);

  const handleJoin = async (clubId: bigint) => {
    if (!actor || !isLoggedIn) {
      navigate("/login");
      return;
    }
    setLoadingJoin(String(clubId));
    try {
      await actor.joinClub(clubId);
      await refreshProfile();
      toast.success("Joined club!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setLoadingJoin(null);
    }
  };
  const handleLeave = async (clubId: bigint) => {
    if (!actor) return;
    setLoadingJoin(String(clubId));
    try {
      await actor.leaveClub(clubId);
      await refreshProfile();
      toast.success("Left club");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to leave");
    } finally {
      setLoadingJoin(null);
    }
  };
  const handleRegister = async (eventId: bigint) => {
    if (!actor || !isLoggedIn) {
      navigate("/login");
      return;
    }
    setLoadingReg(String(eventId));
    try {
      await actor.registerForEvent(eventId);
      await refreshProfile();
      toast.success("Registered for event!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to register");
    } finally {
      setLoadingReg(null);
    }
  };
  const handleUnregister = async (eventId: bigint) => {
    if (!actor) return;
    setLoadingReg(String(eventId));
    try {
      await actor.unregisterFromEvent(eventId);
      await refreshProfile();
      toast.success("Unregistered from event");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to unregister");
    } finally {
      setLoadingReg(null);
    }
  };

  const joinedIds = new Set((profile?.joinedClubs || []).map(String));
  const regIds = new Set((profile?.registeredEvents || []).map(String));
  const clubMap = Object.fromEntries(clubs.map((c) => [String(c.id), c.name]));

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #EAF4FF 0%, #D8EBFF 100%)",
        }}
        className="py-20 px-4"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{ color: "#111827" }}
            >
              Welcome to
              <br />
              <span style={{ color: "#2F6FDE" }}>Smart Digital Club</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: "#6B7280" }}>
              Discover clubs, join events, and connect with fellow students.
              Your complete digital hub for campus life.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
                style={{ background: "#2F6FDE", color: "#fff" }}
                size="lg"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/clubs")}
                size="lg"
                style={{ borderColor: "#2F6FDE", color: "#2F6FDE" }}
              >
                Explore Clubs
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div
              className="w-64 h-64 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(47,111,222,0.08)" }}
            >
              <svg
                viewBox="0 0 200 200"
                className="w-48 h-48"
                aria-hidden="true"
                role="img"
              >
                <title>Students illustration</title>
                <circle cx="100" cy="80" r="25" fill="#2F6FDE" opacity="0.8" />
                <circle cx="60" cy="110" r="18" fill="#3B82F6" opacity="0.6" />
                <circle cx="140" cy="110" r="18" fill="#3B82F6" opacity="0.6" />
                <rect
                  x="45"
                  y="125"
                  width="110"
                  height="50"
                  rx="12"
                  fill="#2F6FDE"
                  opacity="0.15"
                />
                <rect
                  x="55"
                  y="135"
                  width="90"
                  height="8"
                  rx="4"
                  fill="#2F6FDE"
                  opacity="0.4"
                />
                <rect
                  x="55"
                  y="150"
                  width="60"
                  height="6"
                  rx="3"
                  fill="#3B82F6"
                  opacity="0.3"
                />
                <circle cx="100" cy="80" r="10" fill="#fff" />
                <circle cx="60" cy="110" r="8" fill="#fff" />
                <circle cx="140" cy="110" r="8" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Active Clubs", clubs.length],
            ["Upcoming Events", events.length],
            ["Students", "500+"],
            ["Categories", "6+"],
          ].map(([l, v]) => (
            <div
              key={String(l)}
              className="bg-white rounded-xl p-4 text-center shadow-sm"
              style={{ border: "1px solid #E6EEF5" }}
            >
              <div className="text-2xl font-bold" style={{ color: "#2F6FDE" }}>
                {v}
              </div>
              <div className="text-sm" style={{ color: "#6B7280" }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explore Clubs */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Explore Clubs
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate("/clubs")}
            style={{ borderColor: "#2F6FDE", color: "#2F6FDE" }}
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clubs.slice(0, 6).map((club) => (
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
        {clubs.length === 0 && (
          <p className="text-center py-8" style={{ color: "#6B7280" }}>
            No clubs yet. Check back soon!
          </p>
        )}
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Featured Events
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate("/events")}
            style={{ borderColor: "#2F6FDE", color: "#2F6FDE" }}
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {events.slice(0, 4).map((ev) => (
            <EventCard
              key={String(ev.id)}
              event={ev}
              clubName={clubMap[String(ev.clubId)]}
              isRegistered={regIds.has(String(ev.id))}
              onRegister={() => handleRegister(ev.id)}
              onUnregister={() => handleUnregister(ev.id)}
              loading={loadingReg === String(ev.id)}
            />
          ))}
        </div>
        {events.length === 0 && (
          <p className="text-center py-8" style={{ color: "#6B7280" }}>
            No upcoming events yet.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}
