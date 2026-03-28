import { GraduationCap } from "lucide-react";
import { useEffect } from "react";
import { navigate } from "../App";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Login() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { actor } = useActor();
  const { profile, loading } = useApp();

  useEffect(() => {
    if (!identity || identity.getPrincipal().isAnonymous() || loading) return;
    if (profile) navigate("/dashboard");
    else if (actor) navigate("/register");
  }, [identity, profile, actor, loading]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #EAF4FF 0%, #D8EBFF 100%)",
      }}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg"
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
            Welcome Back
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Sign in to your Smart Club account
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full"
          size="lg"
          style={{ background: "#2F6FDE", color: "#fff" }}
        >
          {isLoggingIn ? "Connecting…" : "Login with Internet Identity"}
        </Button>
        <p className="text-center text-xs mt-4" style={{ color: "#6B7280" }}>
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="underline"
            style={{ color: "#2F6FDE" }}
          >
            Register
          </button>
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 w-full text-center text-sm"
          style={{ color: "#9CA3AF" }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
