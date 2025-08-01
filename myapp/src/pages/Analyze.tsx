import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CameraCapture } from "@/components/ui/camera-capture";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImagePreview } from "@/components/ui/image-preview";
import { FeedbackForm } from '@/components/ui/feedback-form';
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DetectedObject {
  label: string;
  confidence: number;
}

const Analyze = () => {
  const navigate = useNavigate();

  // --- State Declarations ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);

  // FIX: Removed the duplicate state declaration. Each modal now has its own unique state.
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTargetLabel, setFeedbackTargetLabel] = useState("");

  // --- Handlers ---
  const handleImageAction = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setAnnotatedImageUrl(null);
    setDetectedObjects([]);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setDetectedObjects([]);
    toast.info("Analyzing image...");

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const imageFile = new File([blob], "capture.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", imageFile);

      const apiResponse = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) throw new Error("Analysis failed on the server.");

      const jsonData = apiResponse.headers.get("X-Json-Data");
      if (jsonData) {
        const parsedData = JSON.parse(jsonData);
        setDetectedObjects(parsedData.detections || []);
      }

      const imageBlob = await apiResponse.blob();
      if (annotatedImageUrl) URL.revokeObjectURL(annotatedImageUrl);
      
      const annotatedUrl = URL.createObjectURL(imageBlob);
      setAnnotatedImageUrl(annotatedUrl);
      
      toast.success("Analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    if (annotatedImageUrl) URL.revokeObjectURL(annotatedImageUrl);
    setSelectedImage(null);
    setAnnotatedImageUrl(null);
    setDetectedObjects([]);
  };

  const handleOpenFeedbackModal = (incorrectLabel: string) => {
    setFeedbackTargetLabel(incorrectLabel);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (feedbackData: Record<string, string>) => {
    if (!selectedImage) return;
    toast.info("Submitting feedback...");
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const imageFile = new File([blob], "feedback.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", imageFile);
      for (const key in feedbackData) {
        formData.append(key, feedbackData[key]);
      }

      const apiResponse = await fetch("http://127.0.0.1:5000/feedback", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) throw new Error("Server failed to process feedback.");

      toast.success("Thank you! Your feedback will help us improve.");
      setIsFeedbackModalOpen(false);
    } catch (error) {
      toast.error("Could not submit feedback.");
      console.error("Feedback error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              AI Object Detection
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </motion.header>

      <CameraCapture
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleImageAction}
      />

      <FeedbackForm
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        incorrectLabel={feedbackTargetLabel}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div className="max-w-6xl mx-auto">
          {selectedImage ? (
            <ImagePreview
              imageUrl={selectedImage}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAnalyze}
              onClear={handleClearImage}
              annotatedImageUrl={annotatedImageUrl}
              detectedObjects={detectedObjects}
              onOpenFeedback={handleOpenFeedbackModal}
            />
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Choose Your Input Method
                </h2>
                <p className="text-lg text-muted-foreground">
                  Upload an image or use your camera to get started
                </p>
              </div>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="upload" className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </TabsTrigger>
                </TabsList>
                <div className="mt-8">
                  <TabsContent value="upload">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <ImageUpload onUpload={handleImageAction} />
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="camera">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center"
                    >
                      <Card className="p-8 bg-gradient-card border-border/50">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Live Camera Capture
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Open a full-screen view to capture an image from your device's camera.
                        </p>
                        <Button
                          onClick={() => setIsCameraModalOpen(true)}
                          size="lg"
                          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Open Camera
                        </Button>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analyze;