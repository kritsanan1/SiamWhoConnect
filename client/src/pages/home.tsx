import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setLocation("/profile-setup");
    } else if (user) {
      setLocation("/discover");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600 thai-text">กำลังโหลด...</p>
      </div>
    </div>
  );
}
