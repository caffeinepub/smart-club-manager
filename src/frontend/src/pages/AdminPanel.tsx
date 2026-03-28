import { CheckCircle, Edit2, Plus, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Club, ContactMessage, Event, UserProfile } from "../backend";
import { EventStatus } from "../backend";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Tab = "clubs" | "students" | "events" | "messages";

interface ClubFormData {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}
interface EventFormData {
  title: string;
  description: string;
  clubId: string;
  date: string;
  location: string;
}

const CATEGORIES = ["Tech", "Sports", "Arts", "Cultural", "Science", "Music"];
const EMPTY_CLUB: ClubFormData = {
  name: "",
  description: "",
  category: "Tech",
  imageUrl: "",
};
const EMPTY_EVENT: EventFormData = {
  title: "",
  description: "",
  clubId: "",
  date: "",
  location: "",
};

export default function AdminPanel() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { isAdmin, refreshProfile } = useApp();
  const [tab, setTab] = useState<Tab>("clubs");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Club modal
  const [clubModal, setClubModal] = useState(false);
  const [clubForm, setClubForm] = useState<ClubFormData>(EMPTY_CLUB);
  const [editingClubId, setEditingClubId] = useState<bigint | null>(null);

  // Event modal
  const [eventModal, setEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<EventFormData>(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState<bigint | null>(null);

  const loadData = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [c, e, s, m] = await Promise.all([
        actor.getAllClubs(),
        actor.getAllEvents(),
        actor.getAllStudents(),
        actor.getAllContactMessages(),
      ]);
      setClubs(c);
      setEvents(e);
      setStudents(s);
      setMessages(m);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadData recreated on actor change
  useEffect(() => {
    loadData();
  }, [actor]);

  if (!identity || identity.getPrincipal().isAnonymous()) {
    navigate("/login");
    return null;
  }

  // Club actions
  const saveClub = async () => {
    if (!actor || !clubForm.name.trim()) return;
    setActionLoading("club-save");
    try {
      if (editingClubId !== null) {
        await actor.updateClub(
          editingClubId,
          clubForm.name,
          clubForm.description,
          clubForm.category,
          clubForm.imageUrl,
        );
        toast.success("Club updated!");
      } else {
        await actor.createClub(
          clubForm.name,
          clubForm.description,
          clubForm.category,
          clubForm.imageUrl,
        );
        toast.success("Club created!");
      }
      setClubModal(false);
      setClubForm(EMPTY_CLUB);
      setEditingClubId(null);
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };
  const deleteClub = async (id: bigint) => {
    if (!actor || !confirm("Delete this club?")) return;
    setActionLoading(`del-club-${id}`);
    try {
      await actor.deleteClub(id);
      toast.success("Club deleted");
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Event actions
  const saveEvent = async () => {
    if (!actor || !eventForm.title.trim() || !eventForm.clubId) return;
    setActionLoading("event-save");
    try {
      const dateMs = new Date(eventForm.date).getTime();
      const dateNs = BigInt(dateMs) * BigInt(1_000_000);
      if (editingEventId !== null) {
        await actor.updateEvent(
          editingEventId,
          eventForm.title,
          eventForm.description,
          dateNs,
          eventForm.location,
        );
        toast.success("Event updated!");
      } else {
        await actor.createEvent(
          eventForm.title,
          eventForm.description,
          BigInt(eventForm.clubId),
          dateNs,
          eventForm.location,
        );
        toast.success("Event created!");
      }
      setEventModal(false);
      setEventForm(EMPTY_EVENT);
      setEditingEventId(null);
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };
  const deleteEvent = async (id: bigint) => {
    if (!actor || !confirm("Delete this event?")) return;
    setActionLoading(`del-event-${id}`);
    try {
      await actor.deleteEvent(id);
      toast.success("Event deleted");
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };
  const approveEvent = async (id: bigint) => {
    setActionLoading(`approve-${id}`);
    try {
      await actor!.approveEvent(id);
      toast.success("Event approved!");
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };
  const rejectEvent = async (id: bigint) => {
    setActionLoading(`reject-${id}`);
    try {
      await actor!.rejectEvent(id);
      toast.success("Event rejected");
      await loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const initAdmin = async () => {
    if (!actor) return;
    try {
      await actor.initAdmin();
      await refreshProfile();
      toast.success("Initialized as admin!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const pendingEvents = events.filter((e) => e.status === EventStatus.pending);

  const TABS: { id: Tab; label: string }[] = [
    { id: "clubs", label: "Clubs" },
    { id: "students", label: "Students" },
    { id: "events", label: "Events" },
    { id: "messages", label: "Messages" },
  ];

  if (!isAdmin)
    return (
      <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "#111827" }}>
            Admin Access Required
          </h1>
          <p className="mb-6" style={{ color: "#6B7280" }}>
            You need admin privileges. Click below to initialize if you are the
            first admin.
          </p>
          <Button
            onClick={initAdmin}
            style={{ background: "#2F6FDE", color: "#fff" }}
          >
            Initialize as Admin
          </Button>
        </div>
      </div>
    );

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Admin Panel
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={initAdmin}
            style={{ borderColor: "#E6EEF5", color: "#6B7280" }}
          >
            Init Admin
          </Button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 bg-white rounded-xl p-1"
          style={{ border: "1px solid #E6EEF5", width: "fit-content" }}
        >
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={
                tab === t.id
                  ? { background: "#2F6FDE", color: "#fff" }
                  : { color: "#6B7280" }
              }
            >
              {t.label}
              {t.id === "events" && pendingEvents.length > 0 && (
                <span
                  className="ml-1 text-xs px-1.5 rounded-full text-white"
                  style={{ background: "#F59E0B" }}
                >
                  {pendingEvents.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            className="bg-white rounded-xl h-64 animate-pulse"
            style={{ border: "1px solid #E6EEF5" }}
          />
        ) : (
          <>
            {/* Clubs Tab */}
            {tab === "clubs" && (
              <div
                className="bg-white rounded-xl p-6"
                style={{ border: "1px solid #E6EEF5" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold" style={{ color: "#111827" }}>
                    Clubs ({clubs.length})
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => {
                      setClubForm(EMPTY_CLUB);
                      setEditingClubId(null);
                      setClubModal(true);
                    }}
                    style={{ background: "#2F6FDE", color: "#fff" }}
                  >
                    <Plus size={14} className="mr-1" />
                    Create Club
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E6EEF5" }}>
                        {["Name", "Category", "Members", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2 px-3 font-medium"
                            style={{ color: "#6B7280" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map((club) => (
                        <tr
                          key={String(club.id)}
                          style={{ borderBottom: "1px solid #F3F7FB" }}
                        >
                          <td
                            className="py-2 px-3 font-medium"
                            style={{ color: "#111827" }}
                          >
                            {club.name}
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {club.category}
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {Number(club.memberCount)}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setClubForm({
                                    name: club.name,
                                    description: club.description,
                                    category: club.category,
                                    imageUrl: club.imageUrl,
                                  });
                                  setEditingClubId(club.id);
                                  setClubModal(true);
                                }}
                                className="p-1 rounded hover:bg-blue-50"
                                style={{ color: "#2F6FDE" }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteClub(club.id)}
                                disabled={
                                  actionLoading === `del-club-${club.id}`
                                }
                                className="p-1 rounded hover:bg-red-50"
                                style={{ color: "#EF4444" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {tab === "students" && (
              <div
                className="bg-white rounded-xl p-6"
                style={{ border: "1px solid #E6EEF5" }}
              >
                <h2 className="font-semibold mb-4" style={{ color: "#111827" }}>
                  Students ({students.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E6EEF5" }}>
                        {[
                          "Name",
                          "Email",
                          "Role",
                          "Clubs",
                          "Events",
                          "Joined",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2 px-3 font-medium"
                            style={{ color: "#6B7280" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr
                          key={s.email}
                          style={{ borderBottom: "1px solid #F3F7FB" }}
                        >
                          <td
                            className="py-2 px-3 font-medium"
                            style={{ color: "#111827" }}
                          >
                            {s.name}
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {s.email}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full capitalize"
                              style={{
                                background:
                                  s.role === "admin" ? "#FEF3C7" : "#DBEAFE",
                                color:
                                  s.role === "admin" ? "#D97706" : "#1D4ED8",
                              }}
                            >
                              {s.role}
                            </span>
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {s.joinedClubs.length}
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {s.registeredEvents.length}
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {new Date(
                              Number(s.createdAt) / 1_000_000,
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {tab === "events" && (
              <div className="space-y-6">
                {pendingEvents.length > 0 && (
                  <div
                    className="bg-white rounded-xl p-6"
                    style={{ border: "1px solid #E6EEF5" }}
                  >
                    <h2
                      className="font-semibold mb-4"
                      style={{ color: "#111827" }}
                    >
                      Pending Approval ({pendingEvents.length})
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #E6EEF5" }}>
                            {["Title", "Date", "Location", "Actions"].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left py-2 px-3 font-medium"
                                  style={{ color: "#6B7280" }}
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {pendingEvents.map((ev) => (
                            <tr
                              key={String(ev.id)}
                              style={{ borderBottom: "1px solid #F3F7FB" }}
                            >
                              <td
                                className="py-2 px-3 font-medium"
                                style={{ color: "#111827" }}
                              >
                                {ev.title}
                              </td>
                              <td
                                className="py-2 px-3"
                                style={{ color: "#6B7280" }}
                              >
                                {new Date(
                                  Number(ev.date) / 1_000_000,
                                ).toLocaleDateString()}
                              </td>
                              <td
                                className="py-2 px-3"
                                style={{ color: "#6B7280" }}
                              >
                                {ev.location}
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => approveEvent(ev.id)}
                                    disabled={!!actionLoading}
                                    className="p-1 rounded hover:bg-green-50"
                                    style={{ color: "#10B981" }}
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => rejectEvent(ev.id)}
                                    disabled={!!actionLoading}
                                    className="p-1 rounded hover:bg-red-50"
                                    style={{ color: "#EF4444" }}
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div
                  className="bg-white rounded-xl p-6"
                  style={{ border: "1px solid #E6EEF5" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold" style={{ color: "#111827" }}>
                      All Events ({events.length})
                    </h2>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEventForm(EMPTY_EVENT);
                        setEditingEventId(null);
                        setEventModal(true);
                      }}
                      style={{ background: "#2F6FDE", color: "#fff" }}
                    >
                      <Plus size={14} className="mr-1" />
                      Create Event
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #E6EEF5" }}>
                          {[
                            "Title",
                            "Status",
                            "Date",
                            "Registered",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-3 font-medium"
                              style={{ color: "#6B7280" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((ev) => (
                          <tr
                            key={String(ev.id)}
                            style={{ borderBottom: "1px solid #F3F7FB" }}
                          >
                            <td
                              className="py-2 px-3 font-medium"
                              style={{ color: "#111827" }}
                            >
                              {ev.title}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full capitalize"
                                style={{
                                  background:
                                    ev.status === "upcoming"
                                      ? "#DBEAFE"
                                      : ev.status === "pending"
                                        ? "#FEF3C7"
                                        : "#F3F4F6",
                                  color:
                                    ev.status === "upcoming"
                                      ? "#1D4ED8"
                                      : ev.status === "pending"
                                        ? "#D97706"
                                        : "#6B7280",
                                }}
                              >
                                {ev.status}
                              </span>
                            </td>
                            <td
                              className="py-2 px-3"
                              style={{ color: "#6B7280" }}
                            >
                              {new Date(
                                Number(ev.date) / 1_000_000,
                              ).toLocaleDateString()}
                            </td>
                            <td
                              className="py-2 px-3"
                              style={{ color: "#6B7280" }}
                            >
                              {ev.registeredUsers.length}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const d = new Date(
                                      Number(ev.date) / 1_000_000,
                                    );
                                    const ds = d.toISOString().slice(0, 16);
                                    setEventForm({
                                      title: ev.title,
                                      description: ev.description,
                                      clubId: String(ev.clubId),
                                      date: ds,
                                      location: ev.location,
                                    });
                                    setEditingEventId(ev.id);
                                    setEventModal(true);
                                  }}
                                  className="p-1 rounded hover:bg-blue-50"
                                  style={{ color: "#2F6FDE" }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteEvent(ev.id)}
                                  disabled={
                                    actionLoading === `del-event-${ev.id}`
                                  }
                                  className="p-1 rounded hover:bg-red-50"
                                  style={{ color: "#EF4444" }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {tab === "messages" && (
              <div
                className="bg-white rounded-xl p-6"
                style={{ border: "1px solid #E6EEF5" }}
              >
                <h2 className="font-semibold mb-4" style={{ color: "#111827" }}>
                  Contact Messages ({messages.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E6EEF5" }}>
                        {["Name", "Email", "Message", "Date"].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2 px-3 font-medium"
                            style={{ color: "#6B7280" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg) => (
                        <tr
                          key={String(msg.id)}
                          style={{ borderBottom: "1px solid #F3F7FB" }}
                        >
                          <td
                            className="py-2 px-3 font-medium"
                            style={{ color: "#111827" }}
                          >
                            {msg.name}
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {msg.email}
                          </td>
                          <td
                            className="py-2 px-3 max-w-xs"
                            style={{ color: "#6B7280" }}
                          >
                            <span title={msg.message}>
                              {msg.message.length > 60
                                ? `${msg.message.slice(0, 57)}…`
                                : msg.message}
                            </span>
                          </td>
                          <td
                            className="py-2 px-3"
                            style={{ color: "#6B7280" }}
                          >
                            {new Date(
                              Number(msg.timestamp) / 1_000_000,
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {messages.length === 0 && (
                    <p
                      className="text-center py-8"
                      style={{ color: "#6B7280" }}
                    >
                      No messages yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Club Modal */}
      {clubModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            style={{ border: "1px solid #E6EEF5" }}
          >
            <h2
              className="font-semibold text-lg mb-4"
              style={{ color: "#111827" }}
            >
              {editingClubId ? "Edit Club" : "Create Club"}
            </h2>
            <div className="space-y-3">
              <input
                value={clubForm.name}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Club Name *"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              />
              <textarea
                value={clubForm.description}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                rows={3}
                style={{ borderColor: "#E6EEF5", resize: "none" }}
              />
              <select
                value={clubForm.category}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                value={clubForm.imageUrl}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="Image URL (optional)"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={saveClub}
                disabled={actionLoading === "club-save"}
                style={{ background: "#2F6FDE", color: "#fff" }}
              >
                {actionLoading === "club-save" ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setClubModal(false);
                  setClubForm(EMPTY_CLUB);
                }}
                style={{ borderColor: "#E6EEF5", color: "#6B7280" }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {eventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            style={{ border: "1px solid #E6EEF5" }}
          >
            <h2
              className="font-semibold text-lg mb-4"
              style={{ color: "#111827" }}
            >
              {editingEventId ? "Edit Event" : "Create Event"}
            </h2>
            <div className="space-y-3">
              <input
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Event Title *"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              />
              <textarea
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                rows={3}
                style={{ borderColor: "#E6EEF5", resize: "none" }}
              />
              <select
                value={eventForm.clubId}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, clubId: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              >
                <option value="">Select Club *</option>
                {clubs.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={eventForm.date}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              />
              <input
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Location"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#E6EEF5" }}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={saveEvent}
                disabled={actionLoading === "event-save"}
                style={{ background: "#2F6FDE", color: "#fff" }}
              >
                {actionLoading === "event-save" ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEventModal(false);
                  setEventForm(EMPTY_EVENT);
                }}
                style={{ borderColor: "#E6EEF5", color: "#6B7280" }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
