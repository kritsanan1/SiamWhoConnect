import { useState, useEffect } from "react";
import { Heart, Users, MessageCircle, Shield, Star, Play, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoPath from "@assets/logo_1753422148892.png";

export default function Landing() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "นิรันดร์",
      age: 28,
      location: "กรุงเทพฯ",
      text: "พบความรักแท้บน LoveMatch หลังจากใช้แอปเพียง 2 เดือน ตอนนี้เราแต่งงานแล้วค่ะ!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "สมชาย",
      age: 32,
      location: "เชียงใหม่",
      text: "ระบบแมตชิ่งแม่นยำมาก พบคนที่ใช่ได้ง่ายขึ้นเยอะ ขอบคุณ LoveMatch ครับ",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "วรรณา",
      age: 26,
      location: "ภูเก็ต",
      text: "ชอบฟีเจอร์วิดีโอโปรไฟล์มาก ทำให้รู้จักคนอื่นได้ดีกว่า และปลอดภัยด้วย",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "แมตชิ่งที่แม่นยำ",
      description: "ระบบ AI ช่วยจับคู่คนที่เข้ากันกับคุณจริงๆ",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      icon: Play,
      title: "วิดีโอโปรไฟล์",
      description: "แนะนำตัวด้วยวิดีโอสั้น ทำให้รู้จักกันได้จริงใจ",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: "ปลอดภัย 100%",
      description: "ตรวจสอบตัวตนและระบบรักษาความปลอดภัย",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: MessageCircle,
      title: "แชทที่ปลอดภัย",
      description: "ข้อความเข้ารหัสและระบบป้องกันการคุกคาม",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];

  const stats = [
    { number: "500K+", label: "สมาชิกทั้งหมด" },
    { number: "50K+", label: "คู่รักที่เกิดขึ้น" },
    { number: "95%", label: "ความพึงพอใจ" },
    { number: "4.8", label: "คะแนนรีวิว" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="gradient-bg relative overflow-hidden">
        <div className="thai-pattern absolute inset-0 opacity-20"></div>
        <div className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-8">
              <img 
                src={logoPath} 
                alt="LoveMatch Thailand" 
                className="h-16 w-16 mr-4 rounded-full object-cover"
              />
              <h1 className="text-4xl md:text-6xl font-bold thai-text">
                LoveMatch Thailand
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-2 thai-text opacity-90">
              ค้นหาความรักที่แท้จริงในประเทศไทย
            </p>
            <p className="text-lg mb-8 thai-text opacity-80">
              แอปหาคู่อันดับ 1 ของไทย ด้วยระบบ AI และวิดีโอโปรไฟล์
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg"
                className="bg-white text-pink-500 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="login-button"
              >
                <Heart className="mr-2" size={20} />
                <span className="thai-text">เริ่มต้นหาคู่</span>
              </Button>
              <div className="flex items-center text-white/80">
                <Play className="mr-2" size={16} />
                <span className="thai-text text-sm">ดูวิดีโอแนะนำ</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm opacity-80 thai-text">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 thai-text">
              ทำไมต้องเลือก LoveMatch?
            </h2>
            <p className="text-xl text-gray-600 thai-text">
              เทคโนโลยีล่าสุดเพื่อช่วยให้คุณพบรักแท้
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={feature.color} size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 thai-text">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 thai-text">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 thai-text">
              เรื่องราวความสำเร็จ
            </h2>
            <p className="text-xl text-gray-600 thai-text">
              ฟังเรื่องราวจากคู่รักที่พบกันผ่าน LoveMatch
            </p>
          </div>

          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-300 fill-current" size={24} />
                  ))}
                </div>
                
                <div className="transition-all duration-500">
                  <p className="text-xl mb-6 thai-text leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  
                  <div className="flex items-center justify-center">
                    <img 
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full mr-4 border-4 border-white object-cover"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-lg thai-text">
                        {testimonials[currentTestimonial].name}, {testimonials[currentTestimonial].age}
                      </div>
                      <div className="opacity-90 thai-text">
                        {testimonials[currentTestimonial].location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-pink-500' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg py-20 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 thai-text">
            พร้อมที่จะพบรักแท้แล้วหรือยัง?
          </h2>
          <p className="text-xl mb-8 thai-text opacity-90">
            เข้าร่วมกับคนนับแสนที่กำลังมองหาความรักบน LoveMatch
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-white text-pink-500 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
              onClick={() => window.location.href = "/api/login"}
              data-testid="cta-login-button"
            >
              <span className="thai-text">สมัครฟรีวันนี้</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center">
              <Check className="mr-2" size={16} />
              <span className="thai-text">สมัครฟรี</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2" size={16} />
              <span className="thai-text">ไม่มีค่าซ่อนเร้น</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2" size={16} />
              <span className="thai-text">ยกเลิกได้ตลอดเวลา</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
