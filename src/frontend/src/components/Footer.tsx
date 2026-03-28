import { GraduationCap } from "lucide-react";
import { navigate } from "../App";

export default function Footer() {
  return (
    <footer style={{ background: "#1E3A8A", color: "#fff" }} className="mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold">Smart Digital Club</span>
          </div>
          <p className="text-sm text-blue-200">
            A smart digital ecosystem for managing all club activities
            efficiently and improving student engagement.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-blue-100">Quick Links</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            {[
              ["Home", "/"],
              ["Clubs", "/clubs"],
              ["Events", "/events"],
              ["Contact", "/contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <button
                  type="button"
                  onClick={() => navigate(h)}
                  className="hover:text-white transition-colors"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-blue-100">Features</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            {[
              "Dashboard",
              "Club Management",
              "Event Management",
              "Notifications",
            ].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-blue-100">Connect</h4>
          <p className="text-sm text-blue-200">smartclub@college.edu</p>
          <p className="text-sm text-blue-200 mt-1">+1 (555) 123-4567</p>
          <p className="text-sm text-blue-200 mt-1">
            123 Campus Drive, University City
          </p>
        </div>
      </div>
      <div className="border-t border-blue-800 py-4 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Smart Digital Club Management System. All
        rights reserved.
      </div>
    </footer>
  );
}
