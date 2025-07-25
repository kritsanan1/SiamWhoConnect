import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MapPin, Settings, User, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";
import SwipeCard from "@/components/ui/swipe-card";
import Navigation from "@/components/ui/navigation";

export default function Discover() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: potentialMatches = [], isLoading } = useQuery({
    queryKey: ["/api/discover/potential-matches"],
    refetchOnWindowFocus: false,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ likedId, isSuper = false }: { likedId: string; isSuper?: boolean }) => {
      const response = await apiRequest("POST", "/api/likes", { likedId, isSuper });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isMutualLike && data.match) {
        setMatchedUser(potentialMatches[currentCardIndex]);
        setShowMatchModal(true);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      nextCard();
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งไลค์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const nextCard = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleSwipeAction = (action: "like" | "pass" | "super") => {
    if (currentCardIndex >= potentialMatches.length) return;
    
    const currentUser = potentialMatches[currentCardIndex];
    
    if (action === "like") {
      likeMutation.mutate({ likedId: currentUser.id });
    } else if (action === "super") {
      likeMutation.mutate({ likedId: currentUser.id, isSuper: true });
    } else {
      nextCard();
    }
  };

  const closeMatchModal = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังค้นหาคนใหม่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="gradient-bg p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <Heart className="text-pink-500" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LoveMatch</h1>
              <p className="text-white/80 text-sm thai-text">ค้นหาคนใหม่</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              data-testid="button-settings"
            >
              <Settings size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              data-testid="button-profile"
            >
              <User size={20} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center text-white/90">
          <MapPin className="mr-2" size={16} />
          <span className="text-sm thai-text">กรุงเทพมหานคร</span>
        </div>
      </div>
      
      {/* Swipe Cards Container */}
      <div className="px-6 -mt-4 relative">
        <div className="relative h-[600px]">
          {currentCardIndex < potentialMatches.length ? (
            <>
              {/* Background cards for visual depth */}
              {currentCardIndex + 2 < potentialMatches.length && (
                <SwipeCard
                  user={potentialMatches[currentCardIndex + 2]}
                  className="absolute inset-0 transform scale-95 opacity-60"
                  isActive={false}
                />
              )}
              
              {currentCardIndex + 1 < potentialMatches.length && (
                <SwipeCard
                  user={potentialMatches[currentCardIndex + 1]}
                  className="absolute inset-0 transform scale-98 opacity-80"
                  isActive={false}
                />
              )}
              
              {/* Active card */}
              <SwipeCard
                user={potentialMatches[currentCardIndex]}
                className="absolute inset-0"
                isActive={true}
                onSwipeAction={handleSwipeAction}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-white rounded-2xl card-shadow flex items-center justify-center">
              <div className="text-center">
                <Heart className="mx-auto mb-4 text-gray-300" size={64} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2 thai-text">หมดแล้ว!</h3>
                <p className="text-gray-600 thai-text">ไม่มีคนใหม่ในตอนนี้</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setCurrentCardIndex(0);
                    queryClient.invalidateQueries({ queryKey: ["/api/discover/potential-matches"] });
                  }}
                  data-testid="button-refresh"
                >
                  <span className="thai-text">รีเฟรช</span>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {currentCardIndex < potentialMatches.length && (
          <div className="flex justify-center items-center space-x-6 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-red-300 hover:bg-red-50"
              onClick={() => handleSwipeAction("pass")}
              disabled={likeMutation.isPending}
              data-testid="button-pass"
            >
              <X className="text-gray-600" size={24} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50"
              onClick={() => handleSwipeAction("super")}
              disabled={likeMutation.isPending}
              data-testid="button-super-like"
            >
              <Star className="text-blue-500" size={20} />
            </Button>
            
            <Button
              size="icon"
              className="w-14 h-14 rounded-full gradient-bg hover:shadow-lg"
              onClick={() => handleSwipeAction("like")}
              disabled={likeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className="text-white" size={24} />
            </Button>
          </div>
        )}
      </div>

      {/* Match Notification Modal */}
      {showMatchModal && matchedUser && (
        <div className="fixed inset-0 gradient-bg flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="text-8xl mb-4">💖</div>
            <h2 className="text-4xl font-bold text-white mb-2">It's a Match!</h2>
            <p className="text-white/90 text-lg mb-8 thai-text">
              คุณและ{matchedUser.displayName}ชอบกันและกัน
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="ghost" 
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full"
                onClick={closeMatchModal}
                data-testid="button-continue-swiping"
              >
                <span className="thai-text">ดูต่อ</span>
              </Button>
              <Button 
                className="px-6 py-3 bg-white text-pink-500 hover:bg-gray-50 rounded-full"
                data-testid="button-send-message"
              >
                <span className="thai-text">ส่งข้อความ</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Navigation activeTab="discover" />
    </div>
  );
}
