import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/ui/navigation";
import type { Match, User } from "@shared/schema";

type MatchWithUser = Match & { otherUser: User };

export default function Chats() {
  const [, setLocation] = useLocation();
  
  const { data: matches = [], isLoading } = useQuery<MatchWithUser[]>({
    queryKey: ["/api/matches"],
  });

  const openChat = (matchId: string) => {
    setLocation(`/chat/${matchId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังโหลดแชท...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="gradient-bg p-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white thai-text">แชท</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            data-testid="button-search-chats"
          >
            <Search size={20} />
          </Button>
        </div>
      </div>
      
      <div className="px-6 -mt-4">
        <Card className="rounded-t-2xl">
          <CardContent className="p-6">
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 thai-text">ยังไม่มีการสนทนา</h3>
                <p className="text-gray-600 thai-text">หาคู่แมตช์ก่อนเพื่อเริ่มการสนทนา</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setLocation("/discover")}
                  data-testid="button-find-matches"
                >
                  <span className="thai-text">หาคู่แมตช์</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div 
                    key={match.id} 
                    className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-colors ${
                      index === 0 ? 'bg-pink-50 border border-pink-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => openChat(match.id)}
                    data-testid={`chat-item-${match.otherUser.id}`}
                  >
                    <div className="relative">
                      <img 
                        src={match.otherUser.profileImageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face`}
                        alt={match.otherUser.displayName || "Chat partner"} 
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        index < 2 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 thai-text">
                          {match.otherUser.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(match.createdAt!).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm thai-text">
                        {index === 0 && "พึ่งแมตช์กัน! ส่งข้อความทักทายกัน"}
                        {index === 1 && "สวัสดีค่ะ! ยินดีที่ได้รู้จักนะคะ 😊"}
                        {index > 1 && "แมตช์ใหม่ - เริ่มการสนทนา"}
                      </p>
                    </div>
                    {index === 0 && (
                      <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">1</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation activeTab="chats" />
    </div>
  );
}
