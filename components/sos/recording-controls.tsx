"use client";

import { Button } from "@/components/ui/button";
import { MicOff } from "lucide-react";

interface RecordingControlsProps {
  countdown: number;
  duration: number;
  onStop: () => void;
  isRecording: boolean;
}

export function RecordingControls({
  countdown,
  duration,
  onStop,
  isRecording,
}: RecordingControlsProps) {
  const progressPercentage = (duration / 30) * 100;

  return (
    <div className="space-y-4">
      {/* Recording Indicator */}
      <div className="flex items-center justify-center space-x-2 text-red-600">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
        <span className="font-medium">Recording in progress...</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{duration}s</span>
          <span>30s</span>
        </div>
        <div className="w-full bg-red-200 rounded-full h-3">
          <div
            className="bg-red-600 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stop Button */}
      <Button
        variant="outline"
        onClick={onStop}
        className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
      >
        <MicOff className="h-4 w-4" />
        <span>Stop Recording ({countdown}s remaining)</span>
      </Button>
    </div>
  );
}
