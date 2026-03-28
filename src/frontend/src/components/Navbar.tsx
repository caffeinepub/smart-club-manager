import { Bell, GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { navigate } from "../App";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "./ui/button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Clubs", href: "/clubs" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { identity, login, clear } = useInternetIdentity();
  const { profile, isAdmin, unreadCount } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const isLoggedIn = !!(
    identity &&
    !identity.getPrincipal().isAnonymous() &&
    profile
  );

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const go = (href: string) => {
    navigate(href);
    setMenuOpen(false);
    setDropOpen(false);
  };

  return (
    <nav
      style={{ background: "#fff", borderBottom: "1px solid #E6EEF5" }}
      className="sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => go("/")}
          className="flex items-center gap-2 shrink-0"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#2F6FDE" }}
          >
            <GraduationCap size={16} className="text-white" />
          </div>
          <span
            className="font-bold text-base hidden sm:block"
            style={{ color: "#111827" }}
          >
            Smart Digital Club
          </span>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xs hidden md:block">
          <input
            type="text"
            placeholder="Search clubs, events…"
            className="w-full px-3 py-1.5 text-sm rounded-full border"
            style={{ borderColor: "#E6EEF5", background: "#F3F7FB" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value;
                go(q ? `/clubs?q=${encodeURIComponent(q)}` : "/clubs");
              }
            }}
          />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((l) => (
            <button
              type="button"
              key={l.href}
              onClick={() => go(l.href)}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 transition-colors"
              style={{ color: "#374151" }}
            >
              {l.label}
            </button>
          ))}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => go("/dashboard")}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 transition-colors"
              style={{ color: "#374151" }}
            >
              Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => go("/admin")}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 transition-colors"
              style={{ color: "#374151" }}
            >
              Admin
            </button>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => go("/dashboard")}
              className="relative p-2 rounded-full hover:bg-blue-50"
            >
              <Bell size={18} style={{ color: "#374151" }} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs text-white rounded-full flex items-center justify-center"
                  style={{ background: "#EF4444", fontSize: "10px" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropOpen(!dropOpen)}
                className="w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center"
                style={{ background: "#2F6FDE" }}
              >
                {initials}
              </button>
              {dropOpen && (
                <div
                  className="absolute right-0 top-10 w-44 bg-white rounded-lg shadow-lg border z-50"
                  style={{ borderColor: "#E6EEF5" }}
                >
                  <div
                    className="px-3 py-2 border-b"
                    style={{ borderColor: "#E6EEF5" }}
                  >
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "#111827" }}
                    >
                      {profile.name}
                    </p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>
                      {profile.role}
                    </p>
                  </div>
                  {[
                    { label: "Profile", href: "/profile" },
                    { label: "Dashboard", href: "/dashboard" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.href}
                      onClick={() => go(item.href)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                      style={{ color: "#374151" }}
                    >
                      {item.label}
                    </button>
                  ))}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => go("/admin")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                      style={{ color: "#374151" }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <div className="border-t" style={{ borderColor: "#E6EEF5" }}>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setDropOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50"
                      style={{ color: "#EF4444" }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              style={{ background: "#2F6FDE" }}
              className="text-white"
            >
              Login
            </Button>
          )}
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: "#E6EEF5" }}
        >
          <input
            type="text"
            placeholder="Search clubs, events…"
            className="w-full px-3 py-2 text-sm rounded-full border mb-2"
            style={{ borderColor: "#E6EEF5", background: "#F3F7FB" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") go("/clubs");
            }}
          />
          {NAV_LINKS.map((l) => (
            <button
              type="button"
              key={l.href}
              onClick={() => go(l.href)}
              className="text-left px-3 py-2 text-sm rounded hover:bg-blue-50"
              style={{ color: "#374151" }}
            >
              {l.label}
            </button>
          ))}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => go("/dashboard")}
              className="text-left px-3 py-2 text-sm rounded hover:bg-blue-50"
              style={{ color: "#374151" }}
            >
              Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => go("/admin")}
              className="text-left px-3 py-2 text-sm rounded hover:bg-blue-50"
              style={{ color: "#374151" }}
            >
              Admin
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
