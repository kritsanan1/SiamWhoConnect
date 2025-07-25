import { useState, useRef } from "react";
import { Upload, Video, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface VideoProfileUploadProps {
  currentVideoUrl?: string;
  onVideoUpload: (videoUrl: string) => void;
  className?: string;
}

export default function VideoProfileUpload({
  currentVideoUrl,
  onVideoUpload,
  className = "",
}: VideoProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentVideoUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์วิดีโอเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "ขนาดไฟล์ต้องไม่เกิน 50MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Simulate upload process
    setIsUploading(true);
    setTimeout(() => {
      // In a real app, this would upload to cloud storage
      const mockUploadedUrl = `https://example.com/videos/${Date.now()}.mp4`;
      onVideoUpload(mockUploadedUrl);
      setIsUploading(false);
      
      toast({
        title: "อัปโหลดสำเร็จ!",
        description: "วิดีโอโปรไฟล์ของคุณถูกอัปโหลดแล้ว",
      });
    }, 2000);
  };

  const handleRemoveVideo = () => {
    setPreviewUrl(null);
    onVideoUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 thai-text">วิดีโอแนะนำตัว</h3>
        
        {!previewUrl ? (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Video className="mx-auto mb-4 text-gray-400" size={48} />
              <h4 className="text-lg font-medium text-gray-700 mb-2 thai-text">
                อัปโหลดวิดีโอแนะนำตัว
              </h4>
              <p className="text-gray-500 text-sm thai-text mb-4">
                วิดีโอสั้น 15-60 วินาที แนะนำตัวคุณให้คนอื่นได้รู้จัก
              </p>
              <Button 
                className="gradient-bg text-white"
                disabled={isUploading}
                data-testid="button-upload-video"
              >
                <Upload size={20} className="mr-2" />
                <span className="thai-text">เลือกวิดีโอ</span>
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1 thai-text">
              <p>• รองรับไฟล์: MP4, MOV, AVI</p>
              <p>• ขนาดไฟล์: ไม่เกิน 50MB</p>
              <p>• ความยาว: 15-60 วินาที</p>
              <p>• ความละเอียด: 720p ขึ้นไป</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-[9/16] max-w-xs mx-auto bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                loop
                muted
              />
              
              {/* Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 bg-black/40 hover:bg-black/60 text-white rounded-full"
                  onClick={togglePlay}
                  data-testid="button-toggle-play"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Button>
              </div>
              
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full"
                onClick={handleRemoveVideo}
                data-testid="button-remove-video"
              >
                <X size={16} />
              </Button>
            </div>
            
            {isUploading && (
              <div className="text-center">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                  <span className="text-sm text-gray-600 thai-text">กำลังอัปโหลด...</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-change-video"
              >
                <span className="thai-text">เปลี่ยนวิดีโอ</span>
              </Button>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}