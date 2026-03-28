import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Register() {
  const { actor } = useActor();
  const { refreshProfile } = useApp();
  const { identity } = useInternetIdentity();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  if (!identity || identity.getPrincipal().isAnonymous()) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setLoading(true);
    try {
      await actor.createProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
      });
      await refreshProfile();
      toast.success("Profile created!");
      navigate("/dashboard");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #EAF4FF 0%, #D8EBFF 100%)",
      }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg"
        style={{ border: "1px solid #E6EEF5" }}
      >
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3"
            style={{ background: "#2F6FDE" }}
          >
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Create Your Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Join the Smart Club community
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reg-name"
              className="block text-sm font-medium mb-1"
              style={{ color: "#374151" }}
            >
              Full Name *
            </label>
            <input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="John Doe"
              style={{ borderColor: "#E6EEF5" }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium mb-1"
              style={{ color: "#374151" }}
            >
              Email *
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="john@college.edu"
              style={{ borderColor: "#E6EEF5" }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="reg-bio"
              className="block text-sm font-medium mb-1"
              style={{ color: "#374151" }}
            >
              Bio
            </label>
            <textarea
              id="reg-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              placeholder="Tell us about yourself…"
              rows={3}
              style={{ borderColor: "#E6EEF5", resize: "none" }}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
            style={{ background: "#2F6FDE", color: "#fff" }}
          >
            {loading ? "Creating…" : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
