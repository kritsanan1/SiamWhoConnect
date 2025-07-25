import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Globe,
  Eye,
  Heart,
  MessageCircle,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/ui/navigation";

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    notifications: {
      newMatches: true,
      messages: true,
      superLikes: true,
      marketing: false,
    },
    privacy: {
      showOnline: true,
      showDistance: true,
      showAge: true,
      showMutualFriends: true,
    },
    discovery: {
      ageRange: { min: 18, max: 35 },
      maxDistance: 50,
      showMeOn: true,
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const response = await apiRequest("POST", "/api/user/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "บันทึกแล้ว",
        description: "การตั้งค่าของคุณได้รับการอัปเดตแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    },
  });

  const handleToggleSetting = (category: keyof typeof settings, key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="gradient-bg p-6 pb-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/profile")}
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white thai-text">การตั้งค่า</h1>
          <div className="w-10"></div>
        </div>
      </div>
      
      <div className="px-6 -mt-4">
        <Card className="rounded-t-2xl">
          <CardContent className="p-6 space-y-6">
            
            {/* Account Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 thai-text">บัญชีผู้ใช้</h2>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                  onClick={() => setLocation("/profile-setup")}
                  data-testid="button-edit-profile"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                      <User className="text-pink-500" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 thai-text">แก้ไขโปรไฟล์</div>
                      <div className="text-sm text-gray-600 thai-text">เปลี่ยนรูปภาพ ชื่อ และข้อมูลส่วนตัว</div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                  data-testid="button-subscription"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <CreditCard className="text-purple-500" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 thai-text">สมาชิกพรีเมียม</div>
                      <div className="text-sm text-gray-600 thai-text">จัดการการสมัครสมาชิกและการชำระเงิน</div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Notifications Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 thai-text">การแจ้งเตือน</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="text-pink-500 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-800 thai-text">แมตช์ใหม่</div>
                      <div className="text-sm text-gray-600 thai-text">แจ้งเตือนเมื่อมีคนแมตช์กับคุณ</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.notifications.newMatches}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'newMatches', checked)
                    }
                    data-testid="switch-new-matches"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="text-blue-500 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-800 thai-text">ข้อความใหม่</div>
                      <div className="text-sm text-gray-600 thai-text">แจ้งเตือนเมื่อมีข้อความใหม่</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.notifications.messages}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'messages', checked)
                    }
                    data-testid="switch-messages"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="text-purple-500 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-800 thai-text">การตลาด</div>
                      <div className="text-sm text-gray-600 thai-text">ข้อมูลข่าวสารและโปรโมชั่น</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('notifications', 'marketing', checked)
                    }
                    data-testid="switch-marketing"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 thai-text">ความเป็นส่วนตัว</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="text-green-500 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-800 thai-text">แสดงสถานะออนไลน์</div>
                      <div className="text-sm text-gray-600 thai-text">ให้คนอื่นเห็นว่าคุณออนไลน์</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.privacy.showOnline}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('privacy', 'showOnline', checked)
                    }
                    data-testid="switch-show-online"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="text-blue-500 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-800 thai-text">แสดงระยะทาง</div>
                      <div className="text-sm text-gray-600 thai-text">แสดงระยะห่างจากตำแหน่งของคุณ</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.privacy.showDistance}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('privacy', 'showDistance', checked)
                    }
                    data-testid="switch-show-distance"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Support Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 thai-text">ช่วยเหลือ</h2>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                  data-testid="button-help"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <HelpCircle className="text-yellow-600" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 thai-text">ศูนย์ช่วยเหลือ</div>
                      <div className="text-sm text-gray-600 thai-text">FAQ และการติดต่อฝ่ายสนับสนุน</div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                  data-testid="button-safety"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <Shield className="text-green-600" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 thai-text">ความปลอดภัย</div>
                      <div className="text-sm text-gray-600 thai-text">คำแนะนำและการรายงานปัญหา</div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Logout */}
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-center p-4 hover:bg-red-50 rounded-xl h-auto text-red-600"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-3" size={20} />
              <span className="font-medium thai-text">ออกจากระบบ</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Navigation activeTab="profile" />
    </div>
  );
}