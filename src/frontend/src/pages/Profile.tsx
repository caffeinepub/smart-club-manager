import { Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Profile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, refreshProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  // Hooks must all be declared before any early returns
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setBio(profile.bio);
    }
  }, [profile]);

  if (!identity || identity.getPrincipal().isAnonymous()) {
    navigate("/login");
    return null;
  }
  if (!profile) {
    navigate("/register");
    return null;
  }

  const handleSave = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      await actor.updateProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
      });
      await refreshProfile();
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const initials = profile.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const memberSince = new Date(
    Number(profile.createdAt) / 1_000_000,
  ).toLocaleDateString();

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#111827" }}>
          My Profile
        </h1>
        <div
          className="bg-white rounded-xl p-6"
          style={{ border: "1px solid #E6EEF5" }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "#2F6FDE" }}
            >
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
                {profile.name}
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {profile.email}
              </p>
              <span
                className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize"
                style={{
                  background: profile.role === "admin" ? "#FEF3C7" : "#DBEAFE",
                  color: profile.role === "admin" ? "#D97706" : "#1D4ED8",
                }}
              >
                {profile.role}
              </span>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                style={{ borderColor: "#E6EEF5", color: "#6B7280" }}
              >
                <Edit2 size={14} className="mr-1" /> Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              ["Joined Clubs", profile.joinedClubs.length],
              ["Registered Events", profile.registeredEvents.length],
              ["Member Since", memberSince],
              ["Role", profile.role],
            ].map(([l, v]) => (
              <div
                key={String(l)}
                className="p-3 rounded-lg"
                style={{ background: "#F3F7FB" }}
              >
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {l}
                </p>
                <p
                  className="font-semibold text-sm capitalize"
                  style={{ color: "#111827" }}
                >
                  {String(v)}
                </p>
              </div>
            ))}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="p-name"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#374151" }}
                >
                  Full Name
                </label>
                <input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E6EEF5" }}
                />
              </div>
              <div>
                <label
                  htmlFor="p-email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#374151" }}
                >
                  Email
                </label>
                <input
                  id="p-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E6EEF5" }}
                />
              </div>
              <div>
                <label
                  htmlFor="p-bio"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#374151" }}
                >
                  Bio
                </label>
                <textarea
                  id="p-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  rows={3}
                  style={{ borderColor: "#E6EEF5", resize: "none" }}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  style={{ background: "#2F6FDE", color: "#fff" }}
                >
                  {loading ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  style={{ borderColor: "#E6EEF5", color: "#6B7280" }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#374151" }}
              >
                Bio
              </p>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {profile.bio || "No bio added yet."}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
