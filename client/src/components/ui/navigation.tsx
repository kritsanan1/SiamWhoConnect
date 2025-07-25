import { useLocation } from "wouter";
import { Compass, Heart, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: "discover" | "matches" | "chats" | "profile";
}

export default function Navigation({ activeTab }: NavigationProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    {
      id: "discover",
      label: "ค้นหา",
      icon: Compass,
      path: "/discover",
      testId: "nav-discover",
    },
    {
      id: "matches",
      label: "แมตช์",
      icon: Heart,
      path: "/matches",
      badge: 3,
      testId: "nav-matches",
    },
    {
      id: "chats",
      label: "แชท",
      icon: MessageCircle,
      path: "/chats",
      badge: 2,
      testId: "nav-chats",
    },
    {
      id: "profile",
      label: "โปรไฟล์",
      icon: User,
      path: "/profile",
      testId: "nav-profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`nav-item ${isActive ? 'active' : ''} p-2`}
              onClick={() => setLocation(item.path)}
              data-testid={item.testId}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="relative">
                  <Icon 
                    className={isActive ? "text-pink-500" : "text-gray-400"} 
                    size={24} 
                  />
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{item.badge}</span>
                    </div>
                  )}
                </div>
                <span 
                  className={`text-xs thai-text ${
                    isActive ? "text-pink-500 font-medium" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
