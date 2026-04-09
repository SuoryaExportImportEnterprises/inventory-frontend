import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import API from "@/api/axiosInstance";
import { useCallback } from "react";

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

export const AuthContext = createContext<AuthContextType>({
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

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIME = 5 * 60 * 1000; // 5 minutes

const logout = useCallback(() => {
  setToken(null);
  setUser(null);
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (idleTimer.current) clearTimeout(idleTimer.current);

  window.location.href = "/login";
}, []);

// const startIdleTimer = useCallback(() => {
//   if (idleTimer.current) clearTimeout(idleTimer.current);

//   console.log("START TIMER");

//   idleTimer.current = setTimeout(() => {
//     logout();
//   }, IDLE_TIME);
// }, [logout, IDLE_TIME]);

const resetIdleTimer = useCallback(() => {
  if (idleTimer.current) clearTimeout(idleTimer.current);

  idleTimer.current = setTimeout(() => {
    logout();
  }, IDLE_TIME);
}, [logout, IDLE_TIME]);

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


useEffect(() => {
  if (!user || user.role !== "inventory") return;

  const events = ["mousemove", "mousedown", "keydown", "click", "touchstart", "scroll"];

  events.forEach((event) =>
    window.addEventListener(event, resetIdleTimer)
  );

  resetIdleTimer();

  return () => {
    events.forEach((event) =>
      window.removeEventListener(event, resetIdleTimer)
    );
    if (idleTimer.current) clearTimeout(idleTimer.current);
  };
}, [user, resetIdleTimer]);

  

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

