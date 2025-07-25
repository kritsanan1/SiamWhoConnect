import { useState, useEffect } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@shared/schema";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: User | null;
  currentUser: User | null;
  onSendMessage?: () => void;
}

export default function MatchModal({
  isOpen,
  onClose,
  matchedUser,
  currentUser,
  onSendMessage,
}: MatchModalProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !matchedUser || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="gradient-bg p-6 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
            data-testid="close-match-modal"
          >
            <X size={20} />
          </Button>
          
          <div className="flex items-center justify-center mb-4">
            {showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse-heart text-6xl">💖</div>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white thai-text mb-2">
            คุณแมตช์กันแล้ว!
          </h2>
          <p className="text-white/90 thai-text">
            คุณทั้งคู่สนใจกัน เริ่มการสนทนากันเถอะ!
          </p>
        </div>

        {/* User Profiles */}
        <div className="p-6">
          <div className="flex items-center justify-center space-x-8 mb-6">
            {/* Current User */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-pink-200">
                <AvatarImage 
                  src={currentUser.profileImageUrl || undefined} 
                  alt={currentUser.displayName || "You"} 
                />
                <AvatarFallback className="text-lg font-semibold bg-pink-100 text-pink-700">
                  {(currentUser.displayName || currentUser.firstName || "You")[0]}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-gray-800 thai-text">
                {currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`.trim()}
              </p>
            </div>

            {/* Heart Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center animate-pulse-heart">
                <Heart className="text-white fill-white" size={24} />
              </div>
            </div>

            {/* Matched User */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-purple-200">
                <AvatarImage 
                  src={matchedUser.profileImageUrl || undefined} 
                  alt={matchedUser.displayName || "Match"} 
                />
                <AvatarFallback className="text-lg font-semibold bg-purple-100 text-purple-700">
                  {(matchedUser.displayName || matchedUser.firstName || "Match")[0]}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-gray-800 thai-text">
                {matchedUser.displayName || `${matchedUser.firstName} ${matchedUser.lastName}`.trim()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={onClose}
              data-testid="keep-swiping"
            >
              <span className="thai-text">เลื่อนต่อ</span>
            </Button>
            <Button
              className="flex-1 gradient-bg text-white hover:opacity-90"
              onClick={onSendMessage}
              data-testid="send-message"
            >
              <MessageCircle size={18} className="mr-2" />
              <span className="thai-text">ส่งข้อความ</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}