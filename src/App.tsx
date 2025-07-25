
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Login } from "@/pages/Login";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import Index from "./pages/Index";
import RecordMeal from "./pages/RecordMeal";
import WeightLoss from "./pages/WeightLoss";
import WeightMaintain from "./pages/WeightMaintain";
import Workouts from "./pages/Workouts";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AiCoach from "./pages/AiCoach";
import Help from "./pages/Help";
import About from "./pages/About";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const AppContent = () => {
  const { userProfile, isOnboarded, completeOnboarding } = useUserProfile();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onAuthSuccess={() => window.location.reload()} />;
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userGoal={userProfile?.goal} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/record-meal" element={<RecordMeal />} />
            <Route path="/weight-loss" element={<WeightLoss />} />
            <Route path="/weight-maintain" element={<WeightMaintain />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai-coach" element={<AiCoach />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
