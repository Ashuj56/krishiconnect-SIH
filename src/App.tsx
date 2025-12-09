import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Scanner from "./pages/Scanner";
import Activities from "./pages/Activities";
import FarmProfile from "./pages/FarmProfile";
import Market from "./pages/Market";
import Advisory from "./pages/Advisory";
import Schemes from "./pages/Schemes";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SoilAnalysis from "./pages/SoilAnalysis";
import PesticideDistribution from "./pages/PesticideDistribution";
import Microfinance from "./pages/Microfinance";
import SmartSale from "./pages/SmartSale";
import VerifyGrade from "./pages/VerifyGrade";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/" element={<Index />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/scanner" element={<Scanner />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/farm" element={<FarmProfile />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/advisory" element={<Advisory />} />
                  <Route path="/schemes" element={<Schemes />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/soil-analysis" element={<SoilAnalysis />} />
                  <Route path="/pesticides" element={<PesticideDistribution />} />
                  <Route path="/microfinance" element={<Microfinance />} />
                  <Route path="/smart-sale" element={<SmartSale />} />
                  <Route path="/verify-grade" element={<VerifyGrade />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
