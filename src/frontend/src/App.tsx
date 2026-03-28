import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import AdminPanel from "./pages/AdminPanel";
import ClubDetail from "./pages/ClubDetail";
import Clubs from "./pages/Clubs";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function parseRoute(hash: string) {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/" || path === "") return { view: "home", id: "" };
  if (path === "/login") return { view: "login", id: "" };
  if (path === "/register") return { view: "register", id: "" };
  if (path === "/dashboard") return { view: "dashboard", id: "" };
  if (path === "/clubs") return { view: "clubs", id: "" };
  if (path.startsWith("/clubs/"))
    return { view: "club-detail", id: path.split("/")[2] };
  if (path === "/events") return { view: "events", id: "" };
  if (path.startsWith("/events/"))
    return { view: "event-detail", id: path.split("/")[2] };
  if (path === "/admin") return { view: "admin", id: "" };
  if (path === "/profile") return { view: "profile", id: "" };
  if (path === "/contact") return { view: "contact", id: "" };
  return { view: "home", id: "" };
}

function Router() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const handler = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const { view, id } = route;
  if (view === "login") return <Login />;
  if (view === "register") return <Register />;
  if (view === "dashboard") return <Dashboard />;
  if (view === "clubs") return <Clubs />;
  if (view === "club-detail") return <ClubDetail id={id} />;
  if (view === "events") return <Events />;
  if (view === "event-detail") return <EventDetail id={id} />;
  if (view === "admin") return <AdminPanel />;
  if (view === "profile") return <Profile />;
  if (view === "contact") return <Contact />;
  return <Home />;
}

export function navigate(to: string) {
  window.location.hash = to;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Toaster richColors position="top-right" />
    </AppProvider>
  );
}
