import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface DetectedObject {
  label: string;
  confidence: number;
}

interface ImagePreviewProps {
  imageUrl: string;
  isAnalyzing?: boolean;
  onAnalyze: () => void;
  onClear: () => void;
  annotatedImageUrl: string | null;
  detectedObjects: DetectedObject[];
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  isAnalyzing = false,
  onAnalyze,
  onClear,
  annotatedImageUrl,
  detectedObjects = [],
}) => {
  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {annotatedImageUrl ? "Detection Result" : "Image Preview"}
          </h3>
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden bg-muted"
        >
          <img
            src={annotatedImageUrl || imageUrl}
            alt="Preview"
            className="block max-w-full h-auto mx-auto rounded-lg"
          />
        </motion.div>

        <div className="flex justify-center">
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground min-w-[140px]"
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Detect Objects
              </>
            )}
          </Button>
        </div>
        
        {/* FIX: This section now correctly checks if there are detected objects */}
        {detectedObjects.length > 0 && (
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4 border-t border-border/50"
          >
            <h4 className="font-semibold text-foreground flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              What the AI Found
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {detectedObjects.map((obj, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 text-base"
                >
                  {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* This message shows only if analysis ran but found nothing */}
        {annotatedImageUrl && detectedObjects.length === 0 && (
          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">No specific objects were detected.</p>
          </div>
        )}
      </div>
    </Card>
  );
};