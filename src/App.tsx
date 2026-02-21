import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InlineNotificationProvider } from "@/contexts/InlineNotificationContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Roleta from "./pages/Roleta";
import Outros from "./pages/Outros";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";
import { ModuleGuard } from "./components/ModuleGuard";
import { RoleGuard } from "./components/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InlineNotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/home" 
              element={
                <RoleGuard requiredPermission="canAccessDashboard">
                  <ModuleGuard moduleId="dashboard">
                    <Dashboard />
                  </ModuleGuard>
                </RoleGuard>
              } 
            />
            <Route 
              path="/roleta" 
              element={
                <RoleGuard requiredPermission="canAccessRoleta">
                  <ModuleGuard moduleId="roleta">
                    <Roleta />
                  </ModuleGuard>
                </RoleGuard>
              } 
            />
            <Route 
              path="/outros" 
              element={
                <RoleGuard requiredPermission="canAccessOutros">
                  <Outros />
                </RoleGuard>
              } 
            />
            <Route 
              path="/super-admin" 
              element={
                <RoleGuard requiredPermission="canAccessSuperAdmin" fallbackPath="/home">
                  <SuperAdmin />
                </RoleGuard>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </InlineNotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
