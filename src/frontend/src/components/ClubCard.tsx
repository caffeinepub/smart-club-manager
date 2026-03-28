import { Users } from "lucide-react";
import { navigate } from "../App";
import type { Club } from "../backend";
import { Button } from "./ui/button";

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "#3B82F6",
  Sports: "#10B981",
  Arts: "#8B5CF6",
  Cultural: "#F59E0B",
  Science: "#14B8A6",
  Music: "#EC4899",
};

interface Props {
  club: Club;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  loading?: boolean;
  showActions?: boolean;
}

export default function ClubCard({
  club,
  isJoined,
  onJoin,
  onLeave,
  loading,
  showActions = true,
}: Props) {
  const imgUrl =
    club.imageUrl ||
    `https://picsum.photos/seed/${encodeURIComponent(club.name)}/400/200`;
  const catColor = CATEGORY_COLORS[club.category] || "#6B7280";

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
        onClick={() => navigate(`/clubs/${club.id}`)}
        className="block"
      >
        <img
          src={imgUrl}
          alt={club.name}
          className="w-full h-40 object-cover"
        />
      </button>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
            style={{ background: catColor }}
          >
            {club.category}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/clubs/${club.id}`)}
          className="text-left"
        >
          <h3
            className="font-semibold text-base mb-1 hover:text-blue-600"
            style={{ color: "#111827" }}
          >
            {club.name}
          </h3>
        </button>
        <p className="text-sm mb-3 flex-1" style={{ color: "#6B7280" }}>
          {club.description.length > 100
            ? `${club.description.slice(0, 97)}…`
            : club.description}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: "#6B7280" }}
          >
            <Users size={12} /> {Number(club.memberCount)} members
          </span>
          {showActions &&
            (isJoined ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onLeave}
                disabled={loading}
                style={{
                  borderColor: "#E6EEF5",
                  color: "#6B7280",
                  fontSize: "12px",
                }}
              >
                Leave
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onJoin}
                disabled={loading}
                style={{
                  background: "#2F6FDE",
                  color: "#fff",
                  fontSize: "12px",
                }}
              >
                Join Club
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
