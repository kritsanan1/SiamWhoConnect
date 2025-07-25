import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Settings, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/ui/navigation";
import type { Match, User } from "@shared/schema";

type MatchWithUser = Match & { otherUser: User };

export default function Matches() {
  const [, setLocation] = useLocation();
  
  const { data: matches = [], isLoading } = useQuery<MatchWithUser[]>({
    queryKey: ["/api/matches"],
  });

  const recentMatches = matches.slice(0, 6);
  const allMatches = matches.slice(6);

  const openChat = (matchId: string) => {
    setLocation(`/chat/${matchId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังโหลดแมตช์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="gradient-bg p-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white thai-text">แมตช์ใหม่</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            data-testid="button-filter-matches"
          >
            <Settings size={20} />
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2 thai-text">ยังไม่มีแมตช์</h3>
                <p className="text-gray-600 thai-text">เริ่มสไลป์เพื่อค้นหาคนที่เข้ากันกับคุณ</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setLocation("/discover")}
                  data-testid="button-start-swiping"
                >
                  <span className="thai-text">เริ่มหาคู่</span>
                </Button>
              </div>
            ) : (
              <>
                {/* Recent Matches */}
                {recentMatches.length > 0 && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 thai-text">แมตช์ล่าสุด</h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {recentMatches.map((match) => (
                        <div key={match.id} className="relative">
                          <div 
                            className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
                            onClick={() => openChat(match.id)}
                            data-testid={`match-card-${match.otherUser.id}`}
                          >
                            <img 
                              src={match.otherUser.profileImageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face`} 
                              alt={match.otherUser.displayName || "Match"} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <MessageCircle className="text-white" size={12} />
                          </div>
                          <p className="text-center text-sm font-medium mt-2 thai-text" data-testid={`match-name-${match.otherUser.id}`}>
                            {match.otherUser.displayName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* All Matches */}
                {allMatches.length > 0 && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 thai-text">แมตช์ทั้งหมด</h2>
                    <div className="space-y-4">
                      {allMatches.map((match) => (
                        <div 
                          key={match.id} 
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => openChat(match.id)}
                          data-testid={`match-item-${match.otherUser.id}`}
                        >
                          <img 
                            src={match.otherUser.profileImageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face`}
                            alt={match.otherUser.displayName || "Match"} 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 thai-text">
                              {match.otherUser.displayName}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {match.otherUser.occupation} • {match.otherUser.age} ปี
                            </p>
                            <p className="text-gray-500 text-xs thai-text">
                              แมตช์เมื่อ {new Date(match.createdAt!).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                            data-testid={`button-chat-${match.otherUser.id}`}
                          >
                            <span className="thai-text">แชท</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation activeTab="matches" />
    </div>
  );
}
