import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ImageUploadProps {
  onUpload: (imageDataUrl: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Image</h3>
          <p className="text-sm text-muted-foreground">
            Upload an image file for AI object detection
          </p>
        </div>

        <motion.div
          className={`
            relative aspect-video rounded-lg border-2 border-dashed 
            transition-all duration-300 cursor-pointer
            ${dragActive 
              ? "border-primary bg-primary/5" 
              : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ y: dragActive ? -10 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop an image here, or click to select
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/10 hover:bg-primary/20 border-primary/30"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground text-center">
          Supported formats: JPG, PNG, WebP (max 10MB)
        </p>
      </div>
    </Card>
  );
};