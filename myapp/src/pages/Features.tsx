import { motion } from "framer-motion";
import { Brain, Camera, Zap, Eye, Sparkles, Cloud, Shield, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Camera,
      title: "Smart Detection",
      description: "Advanced computer vision technology identifies objects in real-time with 99% accuracy",
      color: "primary"
    },
    {
      icon: Brain,
      title: "AI Powered",
      description: "State-of-the-art YOLO model trained on over 1 million images for precise object detection",
      color: "secondary"
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Lightning-fast processing with results in under 2 seconds, optimized for real-world use",
      color: "accent"
    },
    {
      icon: Eye,
      title: "Multi-Object Detection",
      description: "Detect and classify multiple objects simultaneously in complex scenes",
      color: "primary"
    },
    {
      icon: Cloud,
      title: "Cloud Processing",
      description: "Leverage cloud infrastructure for powerful processing without local hardware requirements",
      color: "secondary"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is processed securely and never stored without explicit permission",
      color: "accent"
    },
    {
      icon: Cpu,
      title: "Edge Computing",
      description: "Optional local processing for enhanced privacy and reduced latency",
      color: "primary"
    },
    {
      icon: Sparkles,
      title: "Continuous Learning",
      description: "Our AI models are continuously trained and updated for improved accuracy",
      color: "secondary"
    },
    {
      icon: Brain,
      title: "Best In Class",
      description: "Using State-of-the-art technology to ensure top-notch performance and reliability",
      color: "accent"
    },
    
  ];

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
                      Vision AI
                    </h1>
                    <div className="w-24" />
                  </div>
                </div>
              </motion.header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              Powerful Features
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover how our AI-powered vision technology can transform your workflow with these powerful capabilities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full bg-card hover:bg-card/80 transition-colors border-border/50 hover:border-primary/50">
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Card className="p-8 bg-gradient-card border-border/50">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-muted-foreground mb-6">
                Start using our AI vision technology today and transform the way you work with images.
              </p>
              <motion.button
                onClick={() => navigate("/analyze")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-medium inline-flex items-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <Eye className="w-5 h-5" />
                <span>Try It Now</span>
              </motion.button>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
