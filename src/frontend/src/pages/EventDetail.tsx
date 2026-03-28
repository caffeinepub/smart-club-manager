import { Calendar, ChevronLeft, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Club, Event } from "../backend";
import { EventStatus } from "../backend";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "#DBEAFE", text: "#1D4ED8" },
  past: { bg: "#F3F4F6", text: "#6B7280" },
  pending: { bg: "#FEF3C7", text: "#D97706" },
};

export default function EventDetail({ id }: { id: string }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, isAdmin, refreshProfile } = useApp();
  const [event, setEvent] = useState<Event | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isLoggedIn = !!(
    identity &&
    !identity.getPrincipal().isAnonymous() &&
    profile
  );
  const isRegistered =
    profile?.registeredEvents.some((e) => String(e) === id) ?? false;

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getEvent(BigInt(id))
      .then(async (ev) => {
        setEvent(ev);
        if (ev) {
          const c = await actor.getClub(ev.clubId);
          setClub(c);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, id]);

  const handleRegister = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setActionLoading(true);
    try {
      await (isRegistered
        ? actor!.unregisterFromEvent(BigInt(id))
        : actor!.registerForEvent(BigInt(id)));
      await refreshProfile();
      toast.success(isRegistered ? "Unregistered" : "Registered for event!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  };
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await actor!.approveEvent(BigInt(id));
      const ev = await actor!.getEvent(BigInt(id));
      setEvent(ev);
      toast.success("Event approved!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  };
  const handleReject = async () => {
    setActionLoading(true);
    try {
      await actor!.rejectEvent(BigInt(id));
      navigate("/events");
      toast.success("Event rejected");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    );
  if (!event)
    return (
      <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
        <Navbar />
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          Event not found.
        </div>
      </div>
    );

  const sc = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming;
  const dateMs = Number(event.date) / 1_000_000;
  const dateStr = new Date(dateMs).toLocaleString();
  const imgUrl = `https://picsum.photos/seed/${encodeURIComponent(event.title)}/800/350`;

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="flex items-center gap-1 text-sm mb-4"
          style={{ color: "#6B7280" }}
        >
          <ChevronLeft size={16} /> Back to Events
        </button>
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: "1px solid #E6EEF5" }}
        >
          <img
            src={imgUrl}
            alt={event.title}
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: sc.bg, color: sc.text }}
              >
                {event.status}
              </span>
              {club && (
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  {club.name}
                </span>
              )}
            </div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: "#111827" }}
            >
              {event.title}
            </h1>
            <div className="flex flex-col gap-2 mb-4">
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: "#6B7280" }}
              >
                <Calendar size={14} /> {dateStr}
              </span>
              {event.location && (
                <span
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#6B7280" }}
                >
                  <MapPin size={14} /> {event.location}
                </span>
              )}
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: "#6B7280" }}
              >
                <Users size={14} /> {event.registeredUsers.length} registered
              </span>
            </div>
            <p className="mb-6" style={{ color: "#374151" }}>
              {event.description}
            </p>
            <div className="flex gap-3 flex-wrap">
              {event.status === EventStatus.upcoming && (
                <Button
                  onClick={handleRegister}
                  disabled={actionLoading}
                  style={
                    isRegistered
                      ? { borderColor: "#E6EEF5", color: "#6B7280" }
                      : { background: "#2F6FDE", color: "#fff" }
                  }
                  variant={isRegistered ? "outline" : "default"}
                >
                  {actionLoading
                    ? "…"
                    : isRegistered
                      ? "Unregister"
                      : "Register for Event"}
                </Button>
              )}
              {isAdmin && event.status === EventStatus.pending && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    style={{ background: "#10B981", color: "#fff" }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={actionLoading}
                    style={{ borderColor: "#EF4444", color: "#EF4444" }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
