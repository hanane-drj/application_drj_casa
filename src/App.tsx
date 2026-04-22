import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import "./i18n";

import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Directions from "./pages/Directions.tsx";
import DirectionDetail from "./pages/DirectionDetail.tsx";
import RegionMapPage from "./pages/RegionMapPage.tsx";
import Saisie from "./pages/Saisie.tsx";
import ImportExcel from "./pages/ImportExcel.tsx";
import Provision from "./pages/Provision.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/directions" element={<ProtectedRoute><Directions /></ProtectedRoute>} />
            <Route path="/directions/:id" element={<ProtectedRoute><DirectionDetail /></ProtectedRoute>} />
            <Route path="/carte" element={<ProtectedRoute><RegionMapPage /></ProtectedRoute>} />
            <Route path="/saisie" element={<ProtectedRoute><Saisie /></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><ImportExcel /></ProtectedRoute>} />
            <Route path="/admin/provision" element={<Provision />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
