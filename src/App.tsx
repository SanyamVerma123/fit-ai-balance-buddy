
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useUserProfile } from "@/hooks/useUserProfile";
import Index from "./pages/Index";
import WeightGain from "./pages/WeightGain";
import WeightLoss from "./pages/WeightLoss";
import WeightMaintain from "./pages/WeightMaintain";
import Workouts from "./pages/Workouts";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { userProfile, isOnboarded, completeOnboarding } = useUserProfile();

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
            <Route path="/weight-gain" element={<WeightGain />} />
            <Route path="/weight-loss" element={<WeightLoss />} />
            <Route path="/weight-maintain" element={<WeightMaintain />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/progress" element={<Progress />} />
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
