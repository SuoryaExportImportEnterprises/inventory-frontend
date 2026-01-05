import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import API from "@/api/axiosInstance";

export type UserRole = "admin" | "inventory";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  canViewRevenue?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: false,
  login: async () => false,
  logout: () => {},
});



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState<AuthUser | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const IDLE_TIME = 5 * 60 * 1000; // 5 minutes

      const startIdleTimer = () => {
  if (idleTimer.current) clearTimeout(idleTimer.current); 

  idleTimer.current = setTimeout(() => {
    logout();
  }, IDLE_TIME);
};

const resetIdleTimer = () => {
  if (user?.role !== "inventory") return; // 🚫 admin excluded
  startIdleTimer();
};

  const [loading, setLoading] = useState(false);

  

  const login = async (username: string, password: string) => {
  try {
    setLoading(true);

    const res = await API.post("/auth/login", {
      username,
      password
    });

    const jwtToken = res.data.token;
    // const userData = res.data.user;




    // localStorage.setItem("token", jwtToken);
    // localStorage.setItem("user", JSON.stringify(userData));

    // setToken(jwtToken);
    // setUser(userData);

    const userData = {
  ...res.data.user,
  canViewRevenue: Boolean(res.data.user.canViewRevenue), // 🔥 FORCE BOOLEAN
};

localStorage.setItem("token", jwtToken);
localStorage.setItem("user", JSON.stringify(userData));

setToken(jwtToken);
setUser(userData);


    setLoading(false);
    return true;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    setLoading(false);
    return false;
  }
};



const logout = () => {
  setToken(null);
  setUser(null);
  localStorage.clear();

  if (idleTimer.current) clearTimeout(idleTimer.current);

  window.location.href = "/login";
};

useEffect(() => {
  if (!user || user.role !== "inventory") return;

  const events = ["mousemove", "keydown", "click", "scroll"];

  events.forEach(event =>
    window.addEventListener(event, resetIdleTimer)
  );

  startIdleTimer();

  return () => {
    events.forEach(event =>
      window.removeEventListener(event, resetIdleTimer)
    );
    if (idleTimer.current) clearTimeout(idleTimer.current);
  };
}, [user]);

  

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
