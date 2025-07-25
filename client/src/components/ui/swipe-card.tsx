import { useState, useRef } from "react";
import { Play, Info, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  user: User;
  isActive?: boolean;
  className?: string;
  onSwipeAction?: (action: "like" | "pass" | "super") => void;
}

export default function SwipeCard({ 
  user, 
  isActive = false, 
  className,
  onSwipeAction 
}: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showLikeIndicator, setShowLikeIndicator] = useState(false);
  const [showPassIndicator, setShowPassIndicator] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    
    // Show indicators based on swipe direction
    if (deltaX > 50) {
      setShowLikeIndicator(true);
      setShowPassIndicator(false);
    } else if (deltaX < -50) {
      setShowPassIndicator(true);
      setShowLikeIndicator(false);
    } else {
      setShowLikeIndicator(false);
      setShowPassIndicator(false);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !isActive) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipeAction?.("like");
      } else {
        onSwipeAction?.("pass");
      }
    }
    
    // Reset
    setDragOffset({ x: 0, y: 0 });
    setShowLikeIndicator(false);
    setShowPassIndicator(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    
    if (deltaX > 50) {
      setShowLikeIndicator(true);
      setShowPassIndicator(false);
    } else if (deltaX < -50) {
      setShowPassIndicator(true);
      setShowLikeIndicator(false);
    } else {
      setShowLikeIndicator(false);
      setShowPassIndicator(false);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const cardStyle = isActive && isDragging ? {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    transition: 'none',
  } : {};

  return (
    <div
      ref={cardRef}
      className={cn("swipe-card bg-white rounded-2xl card-shadow", className)}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid={`swipe-card-${user.id}`}
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-t-2xl">
        <img 
          src={user.profileImageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face`}
          alt={user.displayName || "Profile"} 
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 video-overlay"></div>
        
        {/* Video Play Button */}
        {user.videoUrl && (
          <Button 
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
            data-testid={`button-play-video-${user.id}`}
          >
            <Play size={24} className="ml-1" />
          </Button>
        )}
        
        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1" data-testid={`text-user-name-${user.id}`}>
                {user.displayName}, {user.age}
              </h3>
              <p className="text-white/90 mb-2">
                {user.occupation} • {user.location}
              </p>
              {user.education && (
                <div className="flex items-center space-x-4 text-sm mb-3">
                  <span>🎓 {user.education}</span>
                </div>
              )}
              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
                      data-testid={`interest-${interest}-${user.id}`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button 
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
              data-testid={`button-info-${user.id}`}
            >
              <Info size={16} />
            </Button>
          </div>
        </div>
        
        {/* Swipe Indicators */}
        <div 
          className={`absolute top-8 left-8 transform -rotate-12 transition-opacity duration-200 ${
            showPassIndicator ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="px-4 py-2 border-4 border-red-500 text-red-500 font-bold text-xl rounded-lg bg-white/90 flex items-center">
            <X size={20} className="mr-1" />
            <span className="thai-text">ผ่าน</span>
          </div>
        </div>
        
        <div 
          className={`absolute top-8 right-8 transform rotate-12 transition-opacity duration-200 ${
            showLikeIndicator ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="px-4 py-2 border-4 border-green-500 text-green-500 font-bold text-xl rounded-lg bg-white/90 flex items-center">
            <Heart size={20} className="mr-1" />
            <span className="thai-text">ชอบ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
