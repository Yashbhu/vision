import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CameraCapture } from "@/components/ui/camera-capture";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImagePreview } from "@/components/ui/image-preview";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// This interface defines the structure for a detected object
interface DetectedObject {
  label: string;
  confidence: number;
}

const Analyze = () => {
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState<string | null>(null);
  
  // NEW: State to hold the text labels
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);

  const handleImageCapture = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setAnnotatedImageUrl(null);
    setDetectedObjects([]);
    toast.success("Image captured successfully!");
  };

  const handleImageUpload = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setAnnotatedImageUrl(null);
    setDetectedObjects([]);
    toast.success("Image uploaded successfully!");
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

      if (!apiResponse.ok) {
        throw new Error("Analysis failed on the server.");
      }

      // --- CORRECTED LOGIC ---
      // 1. Get the JSON data from the custom header
      const jsonData = apiResponse.headers.get("X-Json-Data");
      if (jsonData) {
        const parsedData = JSON.parse(jsonData);
        setDetectedObjects(parsedData.detections || []);
      }

      // 2. Get the annotated image from the response body
      const imageBlob = await apiResponse.blob();
      if (annotatedImageUrl) {
        URL.revokeObjectURL(annotatedImageUrl);
      }
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
    if (annotatedImageUrl) {
      URL.revokeObjectURL(annotatedImageUrl);
    }
    setSelectedImage(null);
    setAnnotatedImageUrl(null);
    setDetectedObjects([]);
    toast.success("Image cleared");
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
        onCapture={handleImageCapture}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {selectedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ImagePreview
                imageUrl={selectedImage}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
                onClear={handleClearImage}
                annotatedImageUrl={annotatedImageUrl}
                detectedObjects={detectedObjects}
              />
            </motion.div>
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
                      <ImageUpload onUpload={handleImageUpload} />
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