import { useState } from "react";
import { Crown, X, Check, Zap, Eye, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function PremiumModal({
  isOpen,
  onClose,
  onUpgrade,
}: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  if (!isOpen) return null;

  const plans = {
    monthly: {
      price: "฿299",
      period: "ต่อเดือน",
      savings: null,
    },
    yearly: {
      price: "฿2,999",
      period: "ต่อปี",
      savings: "ประหยัด 17%",
    },
  };

  const features = [
    {
      icon: Zap,
      title: "Super Likes ไม่จำกัด",
      description: "ส่งซูเปอร์ไลค์ได้ไม่อั้น",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Eye,
      title: "ดูคนที่ไลค์คุณ",
      description: "เห็นใครไลค์คุณก่อนสไลป์",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: MessageCircle,
      title: "ข้อความอ่านแล้ว",
      description: "ดูสถานะข้อความที่ส่งไป",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Heart,
      title: "ไลค์ย้อนหลัง",
      description: "ย้อนไปไลค์คนที่ผ่านไปแล้ว",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="gradient-bg text-white text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
            data-testid="close-premium-modal"
          >
            <X size={20} />
          </Button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="text-white" size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 thai-text">
            ปลดล็อค LoveMatch Premium
          </h2>
          <p className="text-white/90 thai-text">
            ค้นหาความรักได้เร็วขึ้นด้วยฟีเจอร์พิเศษ
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Plan Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                selectedPlan === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
              onClick={() => setSelectedPlan("monthly")}
            >
              รายเดือน
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all relative ${
                selectedPlan === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
              onClick={() => setSelectedPlan("yearly")}
            >
              รายปี
              {plans.yearly.savings && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  ประหยัด
                </span>
              )}
            </button>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900">
              {plans[selectedPlan].price}
            </div>
            <div className="text-gray-600 thai-text">
              {plans[selectedPlan].period}
            </div>
            {plans[selectedPlan].savings && (
              <div className="text-pink-500 text-sm font-medium mt-1">
                {plans[selectedPlan].savings}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${feature.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={feature.color} size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 thai-text">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm thai-text">
                      {feature.description}
                    </p>
                  </div>
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full gradient-bg text-white font-semibold py-4 text-lg"
            onClick={onUpgrade}
            data-testid="upgrade-premium"
          >
            <Crown className="mr-2" size={20} />
            <span className="thai-text">เริ่มใช้ Premium</span>
          </Button>

          <p className="text-center text-xs text-gray-500 mt-4 thai-text">
            ยกเลิกได้ตลอดเวลา • ไม่มีค่าผูกมัด
          </p>
        </CardContent>
      </Card>
    </div>
  );
}