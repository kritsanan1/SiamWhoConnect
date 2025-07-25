import { useState } from "react";
import { Crown, X, Check, Zap, Eye, MessageCircle, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PricingNavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingNavbar({ isOpen, onClose }: PricingNavbarProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const plans = {
    monthly: {
      price: "฿299",
      period: "ต่อเดือน",
      savings: null,
      priceId: "price_monthly",
    },
    yearly: {
      price: "฿2,999",
      period: "ต่อปี",
      savings: "ประหยัด 17%",
      priceId: "price_yearly",
    },
  };

  const features = [
    {
      icon: Zap,
      title: "Super Likes ไม่จำกัด",
      description: "ส่งซูเปอร์ไลค์ได้ไม่อั้น เพิ่มโอกาสแมตช์",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Eye,
      title: "ดูคนที่ไลค์คุณ",
      description: "เห็นใครไลค์คุณก่อนสไลป์ ประหยัดเวลา",
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
    {
      icon: Star,
      title: "Boost โปรไฟล์",
      description: "โปรไฟล์คุณจะขึ้นท็อปให้คนเห็นเยอะขึ้น",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const createCheckoutSession = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        priceId,
        plan: selectedPlan,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (error) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: error.message,
            variant: "destructive",
          });
        }
      }
      setIsProcessing(false);
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างเซสชันการชำระเงินได้",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleUpgrade = () => {
    setIsProcessing(true);
    createCheckoutSession.mutate(plans[selectedPlan].priceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="gradient-bg text-white text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
            data-testid="close-pricing-modal"
          >
            <X size={20} />
          </Button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="text-white" size={32} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2 thai-text">
            LoveMatch Premium
          </h2>
          <p className="text-white/90 thai-text text-lg">
            ค้นหaความรักได้เร็วขึ้น 10 เท่า
          </p>
          
          <Badge className="bg-yellow-500 text-black font-semibold mt-4">
            ลิมิเต็ดไทม์ - ลด 50%
          </Badge>
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
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {plans[selectedPlan].price}
            </div>
            <div className="text-gray-600 thai-text text-lg">
              {plans[selectedPlan].period}
            </div>
            {plans[selectedPlan].savings && (
              <div className="text-pink-500 text-sm font-medium mt-2">
                {plans[selectedPlan].savings}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              เริ่มต้นทดลองใช้ฟรี 7 วัน
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 ${feature.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={feature.color} size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 thai-text mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm thai-text">
                      {feature.description}
                    </p>
                  </div>
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                </div>
              );
            })}
          </div>

          {/* Social Proof */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-current" size={20} />
              ))}
            </div>
            <p className="text-center text-gray-700 thai-text">
              "Premium ช่วยให้ผมพบความรักได้ใน 1 เดือน!" - สมชาย, 29
            </p>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full gradient-bg text-white font-semibold py-4 text-lg mb-4"
            onClick={handleUpgrade}
            disabled={isProcessing}
            data-testid="upgrade-to-premium"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                <span className="thai-text">กำลังดำเนินการ...</span>
              </div>
            ) : (
              <>
                <Crown className="mr-2" size={20} />
                <span className="thai-text">อัพเกรดเป็น Premium</span>
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 thai-text">
              ยกเลิกได้ตลอดเวลา • ไม่มีค่าผูกมัด • ปลอดภัย 100%
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <span>SSL Encrypted</span>
              <span>•</span>
              <span>30-Day Money Back</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}