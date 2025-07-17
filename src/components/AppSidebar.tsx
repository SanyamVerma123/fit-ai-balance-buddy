
import { Home, TrendingUp, TrendingDown, Activity, BarChart3, Dumbbell, Menu, Sparkles, Bot, User, MessageCircle, HelpCircle, Info, Mail } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect } from "react";

interface AppSidebarProps {
  userGoal?: 'gain' | 'loss' | 'maintain';
}

export function AppSidebar({ userGoal }: AppSidebarProps) {
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
      {
        title: "AI Chat",
        url: "/ai-coach",
        icon: MessageCircle,
      },
    ];

    if (userGoal === 'gain') {
      baseItems.splice(2, 0, {
        title: "Weight Gain",
        url: "/weight-gain",
        icon: TrendingUp,
      });
    } else if (userGoal === 'loss') {
      baseItems.splice(2, 0, {
        title: "Weight Loss",
        url: "/weight-loss",
        icon: TrendingDown,
      });
    } else if (userGoal === 'maintain') {
      baseItems.splice(2, 0, {
        title: "Maintain Weight",
        url: "/weight-maintain",
        icon: Activity,
      });
    }

    baseItems.push(
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
      {
        title: "Profile",
        url: "/profile",
        icon: User,
      },
      {
        title: "Help",
        url: "/help",
        icon: HelpCircle,
      },
      {
        title: "About",
        url: "/about",
        icon: Info,
      },
      {
        title: "Contact",
        url: "/contact",
        icon: Mail,
      }
    );

    return baseItems;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FitTracker AI
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-purple-100 data-[active=true]:text-blue-700 data-[active=true]:font-medium transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-3 w-full">
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

export function PremiumSidebarTrigger() {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      <SidebarTrigger className="relative h-16 w-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 transform hover:scale-110 hover:rotate-3">
        <Menu className="h-8 w-8" />
        <span className="sr-only">Toggle Sidebar</span>
      </SidebarTrigger>
    </div>
  );
}
