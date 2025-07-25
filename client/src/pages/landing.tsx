import { Heart, Video, Bot, Share2 } from "lucide-react";
import GradientButton from "@/components/ui/gradient-button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen gradient-bg thai-pattern flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="text-center animate-fade-in relative z-10">
        {/* App Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 card-shadow">
            <Heart className="text-pink-500 text-3xl animate-pulse-heart" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 thai-text">LoveMatch</h1>
          <p className="text-xl text-white/90 font-light thai-text">ไทยแลนด์</p>
        </div>
        
        {/* Welcome Message */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 thai-text">หาคู่แท้ใจที่ใช่สำหรับคุณ</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm mx-auto thai-text">
            พบกับการหาคู่แบบใหม่ด้วยวิดีโอโปรไฟล์ และ AI ที่จะช่วยหาคนที่เข้ากันกับคุณ
          </p>
        </div>
        
        {/* Features */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-start max-w-xs mx-auto text-white/90">
            <Video className="w-8 text-center" size={20} />
            <div className="ml-4 text-left">
              <p className="font-medium">Short Video Profiles</p>
              <p className="text-sm text-white/70 thai-text">โปรไฟล์วิดีโอสั้น</p>
            </div>
          </div>
          <div className="flex items-center justify-start max-w-xs mx-auto text-white/90">
            <Bot className="w-8 text-center" size={20} />
            <div className="ml-4 text-left">
              <p className="font-medium">AI Matching</p>
              <p className="text-sm text-white/70 thai-text">จับคู่อัจฉริยะด้วย AI</p>
            </div>
          </div>
          <div className="flex items-center justify-start max-w-xs mx-auto text-white/90">
            <Share2 className="w-8 text-center" size={20} />
            <div className="ml-4 text-left">
              <p className="font-medium">Social Integration</p>
              <p className="text-sm text-white/70 thai-text">เชื่อมต่อ Facebook, TikTok, Instagram</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          <GradientButton 
            onClick={handleLogin}
            className="w-full py-4 text-lg font-semibold"
            data-testid="button-login"
          >
            <span className="thai-text">เริ่มต้นใช้งาน</span>
          </GradientButton>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-bounce-gentle"></div>
      <div className="absolute top-32 right-16 w-6 h-6 bg-pink-400/30 rounded-full animate-bounce-gentle" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-white/30 rounded-full animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
    </div>
  );
}
