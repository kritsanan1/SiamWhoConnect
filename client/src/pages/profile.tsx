import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Settings, Edit, Crown, Shield, Share2, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import Navigation from "@/components/ui/navigation";
import PremiumModal from "@/components/ui/premium-modal";
import SocialConnectModal from "@/components/ui/social-connect-modal";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleUpgradePremium = () => {
    // In a real app, this would integrate with payment processing
    console.log("Upgrading to premium...");
    setShowPremiumModal(false);
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
      <div className="gradient-bg p-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/discover")}
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-semibold text-white thai-text">โปรไฟล์</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            data-testid="button-settings"
          >
            <Settings size={20} />
          </Button>
        </div>
        
        {/* Profile Info */}
        <div className="text-center text-white">
          <img 
            src={user.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face`}
            alt="Your profile" 
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white"
            data-testid="img-profile"
          />
          <h2 className="text-2xl font-bold mb-1" data-testid="text-display-name">
            {user.displayName || user.firstName}, {user.age}
          </h2>
          <p className="text-white/90 mb-2">{user.occupation}</p>
          <p className="text-white/80 text-sm thai-text">{user.location}</p>
        </div>
      </div>
      
      <div className="px-6 -mt-12 relative">
        <Card className="rounded-t-3xl">
          <CardContent className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 -mt-2">
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-pink-500" data-testid="text-likes-count">127</div>
                <div className="text-sm text-gray-600 thai-text">ไลค์</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600" data-testid="text-matches-count">23</div>
                <div className="text-sm text-gray-600 thai-text">แมตช์</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600" data-testid="text-chats-count">8</div>
                <div className="text-sm text-gray-600 thai-text">แชท</div>
              </div>
            </div>
            
            {/* Menu Options */}
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                data-testid="button-edit-profile"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                    <Edit className="text-pink-500" size={20} />
                  </div>
                  <span className="font-medium text-gray-800 thai-text">แก้ไขโปรไฟล์</span>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                onClick={() => setShowPremiumModal(true)}
                data-testid="button-upgrade-premium"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Crown className="text-purple-500" size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-800 thai-text">อัพเกรดเป็น Premium</div>
                    <div className="text-sm text-gray-600 thai-text">ปลดล็อคฟีเจอร์เพิ่มเติม</div>
                  </div>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                data-testid="button-privacy-settings"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Shield className="text-blue-600" size={20} />
                  </div>
                  <span className="font-medium text-gray-800 thai-text">ความปลอดภัยและความเป็นส่วนตัว</span>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                onClick={() => setShowSocialModal(true)}
                data-testid="button-social-connections"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Share2 className="text-green-600" size={20} />
                  </div>
                  <span className="font-medium text-gray-800 thai-text">เชื่อมต่อโซเชียลมีเดีย</span>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                data-testid="button-help-support"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <HelpCircle className="text-yellow-600" size={20} />
                  </div>
                  <span className="font-medium text-gray-800 thai-text">ความช่วยเหลือและสนับสนุน</span>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl h-auto"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <LogOut className="text-red-600" size={20} />
                  </div>
                  <span className="font-medium text-gray-800 thai-text">ออกจากระบบ</span>
                </div>
                <ArrowLeft className="text-gray-400 rotate-180" size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgradePremium}
      />
      
      <SocialConnectModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />

      <Navigation activeTab="profile" />
    </div>
  );
}
