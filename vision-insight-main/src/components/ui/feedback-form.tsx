import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedbackData: Record<string, string>) => void;
  incorrectLabel: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose, onSubmit, incorrectLabel }) => {
  const [correctLabel, setCorrectLabel] = useState('');
  const [comments, setComments] = useState('');

  // Reset form when the incorrectLabel prop changes (when a new feedback is initiated)
  useEffect(() => {
    if (isOpen) {
      setCorrectLabel('');
      setComments('');
    }
  }, [isOpen, incorrectLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctLabel.trim()) {
      alert('Please provide the correct label.');
      return;
    }
    onSubmit({
      incorrectLabel,
      correctLabel,
      comments,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Provide Feedback</CardTitle>
                    <CardDescription>Your input helps our AI get smarter.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="incorrectLabel">Incorrect Detection</Label>
                    <Input id="incorrectLabel" value={incorrectLabel} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correctLabel">What should it be? (Required)</Label>
                    <Input
                      id="correctLabel"
                      value={correctLabel}
                      onChange={(e) => setCorrectLabel(e.target.value)}
                      required
                      placeholder="e.g., ToolBox"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Comments</Label>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="e.g., The object was partially hidden."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Submit Feedback</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};