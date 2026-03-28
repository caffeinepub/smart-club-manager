import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";

export default function Contact() {
  const { actor } = useActor();
  const { profile } = useApp();
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("All fields required");
      return;
    }
    setLoading(true);
    try {
      await actor.submitContactMessage(
        name.trim(),
        email.trim(),
        message.trim(),
      );
      toast.success("Message sent! We'll get back to you soon.");
      setMessage("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#F3F7FB", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#111827" }}>
          Contact Us
        </h1>
        <p className="mb-8" style={{ color: "#6B7280" }}>
          Have questions? We'd love to hear from you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4 mb-8">
              {[
                { icon: Mail, label: "Email", value: "smartclub@college.edu" },
                { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                {
                  icon: MapPin,
                  label: "Address",
                  value: "123 Campus Drive, University City",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "#DBEAFE" }}
                  >
                    <Icon size={16} style={{ color: "#2F6FDE" }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#6B7280" }}>
                      {label}
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#111827" }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #EAF4FF 0%, #D8EBFF 100%)",
              }}
            >
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#1D4ED8" }}
              >
                Office Hours
              </p>
              <p className="text-sm" style={{ color: "#374151" }}>
                Monday &ndash; Friday: 9am &ndash; 5pm
              </p>
              <p className="text-sm" style={{ color: "#374151" }}>
                Saturday: 10am &ndash; 2pm
              </p>
            </div>
          </div>
          <div
            className="bg-white rounded-xl p-6"
            style={{ border: "1px solid #E6EEF5" }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="c-name"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#374151" }}
                >
                  Name *
                </label>
                <input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E6EEF5" }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="c-email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#374151" }}
                >
                  Email *
                </label>
                <input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E6EEF5" }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="c-message"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#374151" }}
                >
                  Message *
                </label>
                <textarea
                  id="c-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  rows={5}
                  placeholder="Your message…"
                  style={{ borderColor: "#E6EEF5", resize: "none" }}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                style={{ background: "#2F6FDE", color: "#fff" }}
              >
                {loading ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
