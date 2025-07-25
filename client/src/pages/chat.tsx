import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Video, MoreVertical, Camera, Smile, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Match, User, Message } from "@shared/schema";

type MatchWithMessages = Match & { 
  user1: User; 
  user2: User; 
  messages: (Message & { sender: User })[] 
};

export default function Chat() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  const matchId = params.matchId;

  const { data: matchData, isLoading } = useQuery<MatchWithMessages>({
    queryKey: [`/api/matches/${matchId}/messages`],
    enabled: !!matchId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        matchId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const otherUser = matchData ? 
    (matchData.user1.id === currentUser?.id ? matchData.user2 : matchData.user1) : 
    null;

  const handleSendMessage = () => {
    const content = messageText.trim();
    if (!content) return;
    
    sendMessageMutation.mutate(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [matchData?.messages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังโหลดการสนทนา...</p>
        </div>
      </div>
    );
  }

  if (!matchData || !otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 thai-text">ไม่พบการสนทนา</h3>
          <Button onClick={() => setLocation("/chats")} data-testid="button-back-to-chats">
            <span className="thai-text">กลับไปหน้าแชท</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Chat Header */}
      <div className="gradient-bg p-6 pb-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/chats")}
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
          </Button>
          <img 
            src={otherUser.profileImageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face`}
            alt={otherUser.displayName || "Chat partner"} 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white" data-testid="text-chat-partner-name">
              {otherUser.displayName}
            </h1>
            <p className="text-white/80 text-sm thai-text">ออนไลน์</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              data-testid="button-video-call"
            >
              <Video size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              data-testid="button-chat-options"
            >
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto" data-testid="chat-messages">
        {/* System Message */}
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm thai-text">
            คุณและ{otherUser.displayName}แมตช์กันแล้ว!
          </div>
        </div>
        
        {/* Messages */}
        {matchData.messages.map((message) => {
          const isOwnMessage = message.senderId === currentUser?.id;
          
          return (
            <div 
              key={message.id} 
              className={`flex items-end space-x-2 ${isOwnMessage ? 'justify-end' : ''}`}
              data-testid={`message-${message.id}`}
            >
              {!isOwnMessage && (
                <img 
                  src={otherUser.profileImageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face`}
                  alt={otherUser.displayName || "Chat partner"} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              
              <div className="max-w-xs">
                <div 
                  className={`p-3 rounded-2xl ${
                    isOwnMessage 
                      ? 'gradient-bg text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right mr-2' : 'ml-2'}`}>
                  {new Date(message.createdAt!).toLocaleTimeString('th-TH', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              {isOwnMessage && (
                <img 
                  src={currentUser?.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face`}
                  alt="You" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600"
            data-testid="button-camera"
          >
            <Camera size={20} />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="พิมพ์ข้อความ..."
              className="pr-12 rounded-full border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-testid="button-emoji"
            >
              <Smile size={20} />
            </Button>
          </div>
          
          <Button 
            size="icon" 
            className="w-10 h-10 rounded-full gradient-bg hover:shadow-lg"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            data-testid="button-send"
          >
            <Send className="text-white" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
