import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, Plus, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { updateProfileSchema, type UpdateProfile } from "@shared/schema";
import InterestTag from "@/components/ui/interest-tag";
import GradientButton from "@/components/ui/gradient-button";

const interests = [
  { category: "🎵 เพลงและศิลปะ", tags: ["เพลงป็อป", "เพลงอินดี้", "คอนเสิร์ต", "วาดรูป", "ถ่ายรูป"] },
  { category: "✈️ ท่องเที่ยว", tags: ["เที่ยวทะเล", "เที่ยวภูเขา", "เที่ยวต่างประเทศ", "เที่ยวในประเทศ"] },
  { category: "🍴 อาหารและเครื่องดื่ม", tags: ["อาหารไทย", "อาหารญี่ปุ่น", "กาแฟ", "ทำอาหาร", "เบเกอรี่"] },
  { category: "🏃‍♀️ กีฬาและออกกำลังกาย", tags: ["ยิม", "วิ่ง", "โยคะ", "ว่ายน้ำ", "เทนนิส"] },
  { category: "📚 การเรียนรู้", tags: ["อ่านหนังสือ", "เรียนภาษา", "โปรแกรมมิ่ง", "ดูสารคดี"] },
];

type ProfileSetupStep = "basic" | "interests" | "video";

export default function ProfileSetup() {
  const [step, setStep] = useState<ProfileSetupStep>("basic");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: "",
      age: 25,
      gender: "female",
      location: "",
      bio: "",
      occupation: "",
      education: "",
      interests: [],
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const response = await apiRequest("POST", "/api/profile/complete", {
        ...data,
        interests: selectedInterests,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "สำเร็จ!",
        description: "โปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      });
      setLocation("/discover");
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfile) => {
    if (selectedInterests.length < 3) {
      toast({
        title: "กรุณาเลือกความสนใจ",
        description: "กรุณาเลือกความสนใจอย่างน้อย 3 อย่าง",
        variant: "destructive",
      });
      return;
    }
    profileMutation.mutate(data);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-pink-100">
            <Camera className="text-gray-400" size={32} />
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center">
            <Plus size={16} />
          </button>
        </div>
        <p className="text-gray-600 text-sm thai-text">เพิ่มรูปโปรไฟล์</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="thai-text">ชื่อเล่น</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ใส่ชื่อเล่นของคุณ" data-testid="input-display-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="thai-text">อายุ</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger data-testid="select-age">
                      <SelectValue placeholder="เลือกอายุ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({length: 50}, (_, i) => i + 18).map(age => (
                      <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="thai-text">เพศ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">ชาย</SelectItem>
                    <SelectItem value="female">หญิง</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="thai-text">จังหวัด</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="เลือกจังหวัด" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="กรุงเทพมหานคร">กรุงเทพมหานคร</SelectItem>
                  <SelectItem value="เชียงใหม่">เชียงใหม่</SelectItem>
                  <SelectItem value="ภูเก็ต">ภูเก็ต</SelectItem>
                  <SelectItem value="ขอนแก่น">ขอนแก่น</SelectItem>
                  <SelectItem value="ชลบุรี">ชลบุรี</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="thai-text">อาชีพ</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="อาชีพของคุณ" data-testid="input-occupation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="thai-text">เกี่ยวกับฉัน</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  rows={3} 
                  placeholder="เล่าเรื่องราวของคุณให้ทุกคนได้รู้จัก..." 
                  className="resize-none"
                  data-testid="textarea-bio"
                />
              </FormControl>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-sm thai-text">แนะนำตัวให้น่าสนใจ</span>
                <span className="text-gray-400 text-sm">{field.value?.length || 0}/500</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderInterests = () => (
    <div className="space-y-6">
      <p className="text-gray-600 text-center thai-text">เลือกความสนใจของคุณ (อย่างน้อย 3 อย่าง)</p>
      
      {interests.map((category) => (
        <div key={category.category}>
          <h3 className="font-medium text-gray-800 mb-3 thai-text">{category.category}</h3>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => (
              <InterestTag
                key={tag}
                selected={selectedInterests.includes(tag)}
                onClick={() => toggleInterest(tag)}
                data-testid={`interest-tag-${tag}`}
              >
                {tag}
              </InterestTag>
            ))}
          </div>
        </div>
      ))}

      {selectedInterests.length > 0 && (
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4">
            <p className="text-center text-pink-700 font-medium thai-text">
              เลือกแล้ว {selectedInterests.length} ความสนใจ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderVideo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 thai-text">อัปโหลดวิดีโอแนะนำตัว</h2>
        <p className="text-gray-600 mb-6 thai-text">วิดีโอสั้น 30-60 วินาที เพื่อให้คนอื่นรู้จักคุณมากขึ้น</p>
        
        <div className="relative w-full max-w-sm mx-auto mb-6">
          <div className="aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-500 text-sm thai-text">ยังไม่มีวิดีโอ</p>
              </div>
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" data-testid="button-record-video">
            <Camera className="mr-2" size={16} />
            <span className="thai-text">ถ่ายวิดีโอใหม่</span>
          </Button>
          <Button variant="outline" className="w-full" data-testid="button-upload-video">
            <FolderOpen className="mr-2" size={16} />
            <span className="thai-text">เลือกจากคลัง</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const getStepProgress = () => {
    const steps = ["basic", "interests", "video"];
    return steps.map((s, index) => (
      <div 
        key={s}
        className={`w-8 h-2 rounded-full ${
          index === steps.indexOf(step) ? "bg-white" : "bg-white/50"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="gradient-bg p-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {step !== "basic" && (
              <button 
                onClick={() => {
                  if (step === "interests") setStep("basic");
                  else if (step === "video") setStep("interests");
                }}
                className="text-white mr-4"
                data-testid="button-back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-semibold text-white thai-text">ตั้งค่าโปรไฟล์</h1>
          </div>
          <div className="flex space-x-2">
            {getStepProgress()}
          </div>
        </div>
      </div>
      
      <div className="px-6 -mt-6 relative">
        <div className="bg-white rounded-t-3xl p-6 min-h-screen">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === "basic" && renderBasicInfo()}
              {step === "interests" && renderInterests()}
              {step === "video" && renderVideo()}
              
              <div className="pt-4">
                {step === "basic" && (
                  <GradientButton 
                    type="button"
                    onClick={() => setStep("interests")}
                    className="w-full py-4 text-lg font-semibold"
                    data-testid="button-next-interests"
                  >
                    <span className="thai-text">ต่อไป</span>
                  </GradientButton>
                )}
                
                {step === "interests" && (
                  <GradientButton 
                    type="button"
                    onClick={() => setStep("video")}
                    className="w-full py-4 text-lg font-semibold"
                    disabled={selectedInterests.length < 3}
                    data-testid="button-next-video"
                  >
                    <span className="thai-text">ต่อไป</span>
                  </GradientButton>
                )}
                
                {step === "video" && (
                  <div className="space-y-4">
                    <GradientButton 
                      type="submit"
                      className="w-full py-4 text-lg font-semibold"
                      disabled={profileMutation.isPending}
                      data-testid="button-complete-profile"
                    >
                      {profileMutation.isPending ? (
                        <span className="thai-text">กำลังบันทึก...</span>
                      ) : (
                        <span className="thai-text">เสร็จสิ้น</span>
                      )}
                    </GradientButton>
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      className="w-full text-gray-600"
                      disabled={profileMutation.isPending}
                      data-testid="button-skip-video"
                    >
                      <span className="thai-text">ข้ามไปก่อน</span>
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
