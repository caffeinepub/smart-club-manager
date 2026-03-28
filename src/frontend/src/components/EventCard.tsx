import { Calendar, MapPin } from "lucide-react";
import { navigate } from "../App";
import type { Event } from "../backend";
import { EventStatus } from "../backend";
import { Button } from "./ui/button";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "#DBEAFE", text: "#1D4ED8" },
  past: { bg: "#F3F4F6", text: "#6B7280" },
  pending: { bg: "#FEF3C7", text: "#D97706" },
};

interface Props {
  event: Event;
  clubName?: string;
  isRegistered: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  loading?: boolean;
  showActions?: boolean;
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function EventCard({
  event,
  clubName,
  isRegistered,
  onRegister,
  onUnregister,
  loading,
  showActions = true,
  isAdmin,
  onApprove,
  onReject,
}: Props) {
  const imgUrl = `https://picsum.photos/seed/${encodeURIComponent(event.title)}/400/200`;
  const sc = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming;
  const dateMs = Number(event.date) / 1_000_000;
  const dateStr = new Date(dateMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col"
      style={{
        border: "1px solid #E6EEF5",
        boxShadow: "0 1px 4px rgba(47,111,222,0.06)",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/events/${event.id}`)}
        className="block"
      >
        <img
          src={imgUrl}
          alt={event.title}
          className="w-full h-40 object-cover"
        />
      </button>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: sc.bg, color: sc.text }}
          >
            {event.status}
          </span>
          {clubName && (
            <span className="text-xs" style={{ color: "#6B7280" }}>
              {clubName}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate(`/events/${event.id}`)}
          className="text-left"
        >
          <h3
            className="font-semibold text-base mb-2 hover:text-blue-600"
            style={{ color: "#111827" }}
          >
            {event.title}
          </h3>
        </button>
        <div className="flex flex-col gap-1 mb-3">
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: "#6B7280" }}
          >
            <Calendar size={11} /> {dateStr}
          </span>
          {event.location && (
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "#6B7280" }}
            >
              <MapPin size={11} /> {event.location}
            </span>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2 mt-auto">
            {event.status === EventStatus.upcoming &&
              (isRegistered ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUnregister}
                  disabled={loading}
                  className="flex-1"
                  style={{
                    borderColor: "#E6EEF5",
                    color: "#6B7280",
                    fontSize: "12px",
                  }}
                >
                  Unregister
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onRegister}
                  disabled={loading}
                  className="flex-1"
                  style={{
                    background: "#2F6FDE",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                >
                  Register
                </Button>
              ))}
            {isAdmin &&
              event.status === EventStatus.pending &&
              onApprove &&
              onReject && (
                <>
                  <Button
                    size="sm"
                    onClick={onApprove}
                    disabled={loading}
                    className="flex-1"
                    style={{
                      background: "#10B981",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                    disabled={loading}
                    className="flex-1"
                    style={{
                      borderColor: "#EF4444",
                      color: "#EF4444",
                      fontSize: "12px",
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
