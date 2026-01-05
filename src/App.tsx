// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Layout
import AdminLayout from "@/components/admin/AdminLayout";

// Auth
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Inventory pages
import InventoryDashboard from "./pages/inventory/Dashboard";
import InwardList from "./pages/inventory/InwardList";
import InwardNew from "./pages/inventory/InwardNew";
import InwardDetail from "./pages/inventory/InwardDetail";
import OutwardList from "./pages/inventory/OutwardList";
import OutwardNew from "./pages/inventory/OutwardNew";
import OutwardDetail from "./pages/inventory/OutwardDetail";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInward from "./pages/admin/AdminInward";
import AdminOutward from "./pages/admin/AdminOutward";
import Revenue from "./pages/admin/RevenueBoard";
import InventorySummary from "./pages/admin/InventorySummary";
import AdminDiscrepancyList from "./pages/admin/AdminDiscrepancyList";
import AdminDiscrepancyDetail from "./pages/admin/AdminDiscrepancyDetail";
import ManageDropdowns from "@/pages/admin/ManageDropdowns";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>

              {/* Default → Login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Login Page */}
              <Route path="/login" element={<Login />} />

              {/* ---------------------------------------------------------------- */}
              {/*                          INVENTORY ROUTES                       */}
              {/* ---------------------------------------------------------------- */}
              <Route
                path="/inventory/dashboard"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <InventoryDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/inward"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <InwardList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/inward/new"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <InwardNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/inward/:id"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <InwardDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/outward"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <OutwardList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/outward/new"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <OutwardNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory/outward/:id"
                element={
                  <ProtectedRoute allowedRole="inventory">
                    <OutwardDetail />
                  </ProtectedRoute>
                }
              />

              {/*                            ADMIN ROUTES                         */}


              {/* All admin pages wrapped inside AdminLayout */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                {/* DEFAULT → /admin/dashboard */}
                <Route index element={<AdminInward/>} />

                <Route path="dashboard" element={<AdminInward />} />
                <Route path="inward" element={<AdminInward />} />
                <Route path="inward/:id" element={<InwardDetail />} />

                <Route path="outward" element={<AdminOutward />} />
                <Route path="discrepancies" element={<AdminDiscrepancyList />} />
                <Route path="discrepancies/:id" element={<AdminDiscrepancyDetail />} />
                <Route path="revenue-board" element={<Revenue />} />
                <Route path="inventory-summary" element={<InventorySummary />} />
                <Route path="manage-dropdowns" element={<ManageDropdowns />} />
                {/* <Route path="notifications" element={<Notifications />} /> */}
                <Route path="outward/:id" element={<OutwardDetail />} />

              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
