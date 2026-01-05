import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  MoveDown,
  MoveUp,
  AlertTriangle,
  IndianRupee,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";
import { fetchPendingDiscrepancyCount } from "@/api/discrepancyApi";



export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const [pendingCount, setPendingCount] = useState(0);



useEffect(() => {
  async function loadCount() {
    try {
      const res = await fetchPendingDiscrepancyCount();
      setPendingCount(res.data.count);
    } catch (err) {
      console.error("Discrepancy count error", err);
    }
  }

  loadCount();
  const interval = setInterval(loadCount, 5000);
  return () => clearInterval(interval);
}, []);


  const menuItems = [
    // { name: "Dashboard", icon: <LayoutDashboard />, path: "/admin/dashboard" },
    { name: "Inward Summary", icon: <MoveDown />, path: "/admin/inward" },
    { name: "Outward Summary", icon: <MoveUp />, path: "/admin/outward" },
    {
  name: "Notifications / Issues",
  icon: (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {
  pendingCount > 0 && (
    <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
      {pendingCount}
    </span>
  )
}

    </div>
  ),
  path: "/admin/discrepancies",
},

    ...(user?.canViewRevenue
    ? [{ name: "Revenue Board", icon: <IndianRupee />, path: "/admin/revenue-board" }]
    : []),
    { name: "Inventory Summary", icon: <Boxes />, path: "/admin/inventory-summary" },
    { name: "Manage Dropdowns", icon: <ClipboardList />, path: "/admin/manage-dropdowns" },
  ];

  return (
    <div
      className={`h-screen border-r bg-card shadow-sm transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h2 className="font-bold text-lg">Admin Panel</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium 
              hover:bg-muted transition-colors 
              ${isActive ? "bg-primary text-primary-foreground" : "text-foreground"}`
            }
          >
            <span className="h-5 w-5">{item.icon}</span>
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
