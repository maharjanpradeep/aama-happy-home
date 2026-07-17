import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './hooks/auth-context';
import Schedule from './pages/Schedule';
import CheckIn from './pages/CheckIn';
import AIChatbot from './components/AIChatbot';
import PageAnalytics from './components/PageAnalytics';

const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId="273364795547-p0ihrehn6bqhob2mca4opna939r5hp9t.apps.googleusercontent.com">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <PageAnalytics />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/checkin-admin" element={<Navigate to="/checkin" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;