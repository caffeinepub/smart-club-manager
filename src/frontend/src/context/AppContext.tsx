import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Notification, UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AppContextType {
  profile: UserProfile | null;
  isAdmin: boolean;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  profile: null,
  isAdmin: false,
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshProfile: async () => {},
  refreshNotifications: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!actor || !identity) return;
    try {
      const notifs = await actor.getMyNotifications();
      setNotifications(notifs);
    } catch {
      /* ignore */
    }
  }, [actor, identity]);

  const refreshProfile = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      if (identity && !identity.getPrincipal().isAnonymous()) {
        const [p, admin] = await Promise.all([
          actor.getMyProfile(),
          actor.isCallerAdmin(),
        ]);
        setProfile(p);
        setIsAdmin(admin);
        if (p) {
          const notifs = await actor.getMyNotifications();
          setNotifications(notifs);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        setNotifications([]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [actor, identity]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        profile,
        isAdmin,
        notifications,
        unreadCount,
        loading,
        refreshProfile,
        refreshNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
