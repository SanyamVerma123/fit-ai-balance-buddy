
import { Home, TrendingUp, TrendingDown, Activity, BarChart3, Dumbbell, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  userGoal?: 'gain' | 'loss' | 'maintain';
}

export function AppSidebar({ userGoal }: AppSidebarProps) {
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
      {
        title: "Workouts",
        url: "/workouts",
        icon: Dumbbell,
      },
      {
        title: "Progress",
        url: "/progress",
        icon: BarChart3,
      },
    ];

    // Add goal-specific item based on user preference
    if (userGoal === 'gain') {
      baseItems.splice(1, 0, {
        title: "Weight Gain",
        url: "/weight-gain",
        icon: TrendingUp,
      });
    } else if (userGoal === 'loss') {
      baseItems.splice(1, 0, {
        title: "Weight Loss",
        url: "/weight-loss",
        icon: TrendingDown,
      });
    } else if (userGoal === 'maintain') {
      baseItems.splice(1, 0, {
        title: "Maintain Weight",
        url: "/weight-maintain",
        icon: Activity,
      });
    }

    return baseItems;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FitTracker AI
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-purple-100"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Enhanced Sidebar Trigger with premium look
export function PremiumSidebarTrigger() {
  return (
    <SidebarTrigger className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0">
      <Menu className="h-6 w-6" />
    </SidebarTrigger>
  );
}
