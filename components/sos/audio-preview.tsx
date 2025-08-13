"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Send, Volume2 } from "lucide-react";

interface AudioPreviewProps {
  audioBlob: Blob;
  duration: number;
  onRetry: () => void;
  onSend: () => void;
  isSending: boolean;
}

export function AudioPreview({
  audioBlob,
  duration,
  onRetry,
  onSend,
  isSending,
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio URL
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Audio Recording</h3>
            <p className="text-sm text-gray-600">
              Duration: {formatTime(duration)}
            </p>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              className="w-12 h-12 rounded-full bg-transparent"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <Volume2 className="h-5 w-5 text-gray-400" />
          </div>

          {/* Waveform Visualization (Static) */}
          <div className="flex items-center justify-center space-x-1 h-12 mb-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gray-300 rounded-full transition-colors duration-200 ${
                  (i / 20) * 100 < progressPercentage
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
                style={{
                  height: `${Math.random() * 30 + 10}px`,
                }}
              />
            ))}
          </div>

          {/* Hidden audio element */}
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isSending}
          className="flex items-center space-x-2 bg-transparent"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Record Again</span>
        </Button>

        <Button
          onClick={onSend}
          disabled={isSending}
          className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>{isSending ? "Sending Alert..." : "Send Emergency Alert"}</span>
        </Button>
      </div>

      <p className="text-center text-sm text-gray-600 max-w-md mx-auto">
        Review your emergency recording. This audio will be sent to nearby users
        and security personnel along with your location.
      </p>
    </div>
  );
}
