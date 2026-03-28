import { Bell, Calendar, CheckCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const MOCK_CHART = MONTHS.map((m, i) => ({ month: m, clubs: i + 1 }));

export default function Dashboard() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, notifications, refreshNotifications, isAdmin } = useApp();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loadingMark, setLoadingMark] = useState(false);

  // All hooks must come before any conditional returns
  useEffect(() => {
    if (!actor || !profile) return;
    actor
      .getAllClubs()
      .then((clubs) => {
        const ids = new Set(profile.joinedClubs.map(String));
        setMyClubs(clubs.filter((c) => ids.has(String(c.id))));
      })
      .catch(() => {});
    actor
      .getAllEvents()
      .then((evs) => {
        const ids = new Set(profile.registeredEvents.map(String));
        setMyEvents(
          evs.filter(
            (e) => ids.has(String(e.id)) && e.status === EventStatus.upcoming,
          ),
        );
      })
      .catch(() => {});
  }, [actor, profile]);

  const isLoggedIn = !!(identity && !identity.getPrincipal().isAnonymous());
  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }
  if (!profile) {
    navigate("/register");
    return null;
  }

  const handleMarkAll = async () => {
    if (!actor) return;
    setLoadingMark(true);
    try {
      await actor.markAllNotificationsRead();
      await refreshNotifications();
      toast.success("All notifications marked as read");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingMark(false);
    }
  };

  const handleMark = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.markNotificationRead(id);
      await refreshNotifications();
    } catch {
      /* ignore */
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Welcome back, {profile.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Here's what's happening with your clubs and events.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Joined Clubs",
              value: profile.joinedClubs.length,
              icon: Users,
              color: "#2F6FDE",
            },
            {
              label: "Registered Events",
              value: profile.registeredEvents.length,
              icon: Calendar,
              color: "#10B981",
            },
            {
              label: "Unread Notifications",
              value: unread,
              icon: Bell,
              color: "#F59E0B",
            },
            {
              label: "Role",
              value: profile.role,
              icon: CheckCircle,
              color: "#8B5CF6",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-4 flex items-center gap-3"
              style={{ border: "1px solid #E6EEF5" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${color}20` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "#111827" }}>
                  {value}
                </p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 bg-white rounded-xl p-6"
            style={{ border: "1px solid #E6EEF5" }}
          >
            <h2
              className="font-semibold text-base mb-4"
              style={{ color: "#111827" }}
            >
              Activity Overview
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EEF5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E6EEF5",
                  }}
                />
                <Bar dataKey="clubs" fill="#2F6FDE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            className="bg-white rounded-xl p-6"
            style={{ border: "1px solid #E6EEF5" }}
          >
            <h2
              className="font-semibold text-base mb-4"
              style={{ color: "#111827" }}
            >
              Quick Actions
            </h2>
            <div className="space-y-3">
              {[
                { label: "Browse All Clubs", href: "/clubs", color: "#2F6FDE" },
                { label: "View Events", href: "/events", color: "#10B981" },
                { label: "Edit Profile", href: "/profile", color: "#8B5CF6" },
                ...(isAdmin
                  ? [{ label: "Admin Panel", href: "/admin", color: "#F59E0B" }]
                  : []),
              ].map(({ label, href, color }) => (
                <Button
                  key={href}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(href)}
                  style={{ borderColor: `${color}40`, color }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-6 bg-white rounded-xl p-6"
          style={{ border: "1px solid #E6EEF5" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold text-base"
              style={{ color: "#111827" }}
            >
              My Clubs
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/clubs")}
              style={{ color: "#2F6FDE", borderColor: "#E6EEF5" }}
            >
              Browse More
            </Button>
          </div>
          {myClubs.length === 0 ? (
            <p
              className="text-sm py-4 text-center"
              style={{ color: "#6B7280" }}
            >
              You haven't joined any clubs yet.{" "}
              <button
                type="button"
                onClick={() => navigate("/clubs")}
                className="underline"
                style={{ color: "#2F6FDE" }}
              >
                Explore clubs
              </button>
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {myClubs.map((club) => (
                <button
                  type="button"
                  key={String(club.id)}
                  onClick={() => navigate(`/clubs/${club.id}`)}
                  className="p-3 rounded-lg text-left hover:bg-blue-50 transition-colors"
                  style={{ background: "#F3F7FB" }}
                >
                  <div
                    className="w-8 h-8 rounded-full mb-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "#2F6FDE" }}
                  >
                    {club.name[0]}
                  </div>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "#111827" }}
                  >
                    {club.name}
                  </p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    {club.category}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="mt-6 bg-white rounded-xl p-6"
          style={{ border: "1px solid #E6EEF5" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold text-base"
              style={{ color: "#111827" }}
            >
              Upcoming Events
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/events")}
              style={{ color: "#2F6FDE", borderColor: "#E6EEF5" }}
            >
              View All
            </Button>
          </div>
          {myEvents.length === 0 ? (
            <p
              className="text-sm py-4 text-center"
              style={{ color: "#6B7280" }}
            >
              No upcoming events.{" "}
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="underline"
                style={{ color: "#2F6FDE" }}
              >
                Find events
              </button>
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "#E6EEF5" }}>
              {myEvents.slice(0, 5).map((ev) => {
                const d = new Date(Number(ev.date) / 1_000_000);
                return (
                  <li
                    key={String(ev.id)}
                    className="py-3 flex items-center gap-3"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: "#3B82F6" }}
                    />
                    <button
                      type="button"
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="flex-1 text-left"
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#111827" }}
                      >
                        {ev.title}
                      </p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>
                        {d.toLocaleDateString()} &mdash; {ev.location}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className="mt-6 bg-white rounded-xl p-6"
          style={{ border: "1px solid #E6EEF5" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold text-base"
              style={{ color: "#111827" }}
            >
              Notifications{" "}
              {unread > 0 && (
                <span
                  className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ background: "#EF4444" }}
                >
                  {unread}
                </span>
              )}
            </h2>
            {unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAll}
                disabled={loadingMark}
                style={{ color: "#6B7280", borderColor: "#E6EEF5" }}
              >
                Mark All Read
              </Button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p
              className="text-sm py-4 text-center"
              style={{ color: "#6B7280" }}
            >
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "#E6EEF5" }}>
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={String(n.id)}
                  className="py-3 flex items-start gap-3"
                  style={{ opacity: n.read ? 0.6 : 1 }}
                >
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: "#DBEAFE" }}
                  >
                    <Bell size={14} style={{ color: "#2F6FDE" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: "#111827" }}>
                      {n.message}
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>
                      {new Date(
                        Number(n.timestamp) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMark(n.id)}
                      className="text-xs shrink-0"
                      style={{ color: "#2F6FDE" }}
                    >
                      Read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
