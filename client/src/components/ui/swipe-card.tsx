import { useState, useRef } from "react";
import { Heart, X, Star, Play, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface SwipeCardProps {
  user: User;
  isActive?: boolean;
  onSwipeAction?: (action: 'like' | 'pass' | 'superlike') => void;
}

export default function SwipeCard({ user, isActive = false, onSwipeAction }: SwipeCardProps) {
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const threshold = 100;
      if (Math.abs(dragPosition.x) > threshold) {
        if (dragPosition.x > 0) {
          onSwipeAction?.('like');
        } else {
          onSwipeAction?.('pass');
        }
      } else if (dragPosition.y < -100) {
        onSwipeAction?.('superlike');
      }
      
      setDragPosition({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getSwipeIndicator = () => {
    if (dragPosition.y < -50) {
      return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full font-bold z-10">
          <Star className="inline mr-2" size={16} />
          SUPER LIKE
        </div>
      );
    } else if (dragPosition.x > 50) {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold z-10">
          <Heart className="inline mr-2" size={16} />
          ชอบ
        </div>
      );
    } else if (dragPosition.x < -50) {
      return (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold z-10">
          <X className="inline mr-2" size={16} />
          ผ่าน
        </div>
      );
    }
    return null;
  };

  const rotation = isDragging ? dragPosition.x / 10 : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragPosition.x) / 300) : 1;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-4 bg-white rounded-2xl card-shadow overflow-hidden cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      } ${isActive ? 'z-20' : 'z-10'}`}
      style={{
        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) rotate(${rotation}deg)`,
        opacity,
        scale: isActive ? 1 : 0.95,
      }}
      onMouseDown={handleMouseDown}
      data-testid={`swipe-card-${user.id}`}
    >
      {getSwipeIndicator()}
      
      <div className="relative h-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${user.profileImageUrl || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Video Play Button */}
        {user.videoUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setShowVideo(!showVideo);
            }}
            data-testid={`button-play-video-${user.id}`}
          >
            <Play size={20} />
          </Button>
        )}

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-4">
            <h2 
              className="text-3xl font-bold mb-1 thai-text"
              data-testid={`text-user-name-${user.id}`}
            >
              {user.displayName || `${user.firstName} ${user.lastName}`}, {user.age}
            </h2>
            
            <div className="flex items-center text-white/90 mb-3">
              {user.occupation && (
                <>
                  <Briefcase size={16} className="mr-1" />
                  <span>{user.occupation}</span>
                </>
              )}
              {user.occupation && user.location && <span className="mx-2">•</span>}
              {user.location && (
                <>
                  <MapPin size={16} className="mr-1" />
                  <span>{user.location}</span>
                </>
              )}
            </div>

            {user.education && (
              <div className="flex items-center text-white/90 mb-3">
                <GraduationCap size={16} className="mr-2" />
                <span>🎓 {user.education}</span>
              </div>
            )}

            {user.bio && (
              <p className="text-white/90 text-sm mb-4 thai-text leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 4).map((interest, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="bg-white/20 text-white hover:bg-white/30 thai-text"
                    data-testid={`interest-${interest}-${user.id}`}
                  >
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 4 && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    +{user.interests.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video Overlay */}
        {showVideo && user.videoUrl && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
            <video
              src={user.videoUrl}
              className="max-w-full max-h-full"
              controls
              autoPlay
              onEnded={() => setShowVideo(false)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white"
              onClick={() => setShowVideo(false)}
            >
              <X size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}