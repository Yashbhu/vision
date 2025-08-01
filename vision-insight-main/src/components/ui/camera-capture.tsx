import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// CHANGED: Added new props for controlling visibility
interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    // Prevent starting if already streaming
    if (isStreaming) return;
    
    try {
      setError(null);
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'environment' } // Use back camera
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // Wait for the video to play
        setIsStreaming(true);
      }
    } catch (err) {
      setError("Camera access denied. Please check browser permissions.");
      console.error("Camera access error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isStreaming]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  // NEW: Effect to start/stop camera when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9); // Higher quality
        onCapture(imageDataUrl);
        onClose(); // Close the modal after capture
      }
    }
  }, [onCapture, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          {/* Main camera view */}
          <div className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p>Starting Camera...</p>
              </div>
            )}
            
            {error && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <p className="text-destructive text-center mb-4">{error}</p>
                <Button onClick={startCamera}><RotateCcw className="w-4 h-4 mr-2"/>Try Again</Button>
              </div>
            )}

            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${isStreaming && !error ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Close Button (Top Right) */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
            >
              <X className="w-6 h-6" />
            </Button>
            
            {/* Capture Button (Bottom Center) */}
            {isStreaming && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-black"></div>
                </motion.button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
