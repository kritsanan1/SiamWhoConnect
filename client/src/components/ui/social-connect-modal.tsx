import { useState } from "react";
import { X, Facebook, Instagram, Twitter, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SocialConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialConnectModal({
  isOpen,
  onClose,
}: SocialConnectModalProps) {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async ({ platform }: { platform: string }) => {
      const response = await apiRequest("POST", "/api/social-connections", {
        platform,
        platformUserId: `fake_${platform}_id_${Date.now()}`, // In real app, this would come from OAuth
        username: `user_${platform}`,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-connections"] });
      toast({
        title: "เชื่อมต่อสำเร็จ!",
        description: `เชื่อมต่อ ${getPlatformName(variables.platform)} เรียบร้อยแล้ว`,
      });
      setConnectingPlatform(null);
    },
    onError: (error, variables) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถเชื่อมต่อ ${getPlatformName(variables.platform)} ได้`,
        variant: "destructive",
      });
      setConnectingPlatform(null);
    },
  });

  const getPlatformName = (platform: string) => {
    const names: { [key: string]: string } = {
      facebook: "Facebook",
      instagram: "Instagram",
      tiktok: "TikTok",
      twitter: "Twitter",
    };
    return names[platform] || platform;
  };

  const handleConnect = (platform: string) => {
    setConnectingPlatform(platform);
    // Simulate OAuth flow delay
    setTimeout(() => {
      connectMutation.mutate({ platform });
    }, 1000);
  };

  if (!isOpen) return null;

  const socialPlatforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600",
      description: "เชื่อมต่อโปรไฟล์ Facebook เพื่อแสดงรูปภาพและความสนใจ",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      description: "แสดงรูปภาพ Instagram ในโปรไฟล์ของคุณ",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: Music,
      color: "bg-black",
      description: "เชื่อมต่อ TikTok เพื่อแสดงวิดีโอและความสนใจ",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400",
      description: "เชื่อมต่อ Twitter เพื่อแสดงความคิดเห็นและความสนใจ",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={onClose}
            data-testid="close-social-modal"
          >
            <X size={20} />
          </Button>
          
          <h2 className="text-2xl font-bold mb-2 thai-text">
            เชื่อมต่อโซเชียลมีเดีย
          </h2>
          <p className="text-gray-600 thai-text">
            เชื่อมต่อบัญชีโซเชียลมีเดียเพื่อทำให้โปรไฟล์น่าสนใจยิ่งขึ้น
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isConnecting = connectingPlatform === platform.id;
              
              return (
                <div key={platform.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-600 thai-text">
                        {platform.description}
                      </p>
                    </div>
                    
                    <Button
                      className={`${platform.color} text-white hover:opacity-90`}
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting || connectMutation.isPending}
                      data-testid={`connect-${platform.id}`}
                    >
                      {isConnecting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="thai-text">กำลังเชื่อมต่อ</span>
                        </div>
                      ) : (
                        <span className="thai-text">เชื่อมต่อ</span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 thai-text">
              ความปลอดภัยของข้อมูล
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 thai-text">
              <li>• เราจะไม่โพสต์ข้อมูลลงในบัญชีของคุณ</li>
              <li>• ข้อมูลที่เชื่อมต่อจะใช้เพื่อปรับปรุงโปรไฟล์เท่านั้น</li>
              <li>• คุณสามารถยกเลิกการเชื่อมต่อได้ตลอดเวลา</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}