import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Package } from 'lucide-react';
//import { getNotifications } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { fetchNotifications } from "@/api/notificationApi";
import logo from "@/assets/logoImage.png";


interface Notification {
  _id: string;
  type: "discrepancy" | "rejection" | "inward" | "outward";
  status: "unread" | "read";
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

useEffect(() => {
  async function loadCount() {
    try {
      const res = await fetchNotifications();
const unread = (res.data as Notification[]).filter(
  (n) => n.status === "unread"
).length;

      setNotificationCount(unread);
    } catch (err) {
      console.error("Notification count error", err);
    }
  }

  loadCount();

  const interval = setInterval(loadCount, 5000);
  return () => clearInterval(interval);
}, []);


const handleNotificationClick = () => {
  navigate("/admin/notifications");
};


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            <Link
            to="/inventory/dashboard"
            className="flex items-center gap-3 cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg from-primary to-accent flex items-center justify-center">
                <img
                src={logo}
                alt="Suorya"
                className="h-10 w-auto object-contain"
                />
              </div>
              
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r text-primary bg-clip-text">
                  Inventory System
                </h1>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role} Portal
                </p>
              </div>
            </Link>

            
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleNotificationClick}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </Button>
              )}
              
              <div className="text-sm text-right">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};