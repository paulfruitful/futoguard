"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mic, CheckCircle, MicOff } from "lucide-react";
import { AudioHandler } from "@/src/AI/audiohandler";

interface SOSButtonProps {
  userId: string;
}

export function SOSButton({ userId }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { location, alert, setAlertState, setLocation } = useAppStore();
  const { toast } = useToast();
  const audioHandlerRef = useRef<AudioHandler | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description:
              "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  }, [setLocation, toast]);

  // Recording countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (alert.isRecording && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
        setAlertState({ recordingDuration: 30 - countdown });
      }, 1000);
    } else if (alert.isRecording && countdown === 0) {
      handleSendAlert();
    }
    return () => clearInterval(interval);
  }, [alert.isRecording, countdown]);

  const handleSOSPress = async () => {
    if (!location.latitude || !location.longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location services to send an alert.",
        variant: "destructive",
      });
      return;
    }

    setIsPressed(true);
    setAlertState({ isRecording: true });
    setCountdown(30); // 30 second recording

    // Initialize audio handler
    try {
      if (!audioHandlerRef.current) {
        audioHandlerRef.current = new AudioHandler();
      }

      await audioHandlerRef.current.initialize();

      toast({
        title: "Recording Started",
        description: "Recording audio for 30 seconds...",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to start audio recording.",
        variant: "destructive",
      });
      setAlertState({ isRecording: false });
    }
  };

  const handleSendAlert = async () => {
    try {
      let audioUrl = null;
      let audioBuffer = null;
      let volume = 0;

      // Process audio if recording was active
      if (audioHandlerRef.current) {
        const audioBlob = await audioHandlerRef.current.stopRecording();

        if (audioBlob) {
          // Convert audio to Float32Array for AI analysis
          audioBuffer = await audioHandlerRef.current.blobToFloat32Array(
            audioBlob
          );
          volume = audioHandlerRef.current.getCurrentVolume();

          // Upload audio to Firebase
          audioUrl = await audioHandlerRef.current.uploadAudioToFirebase(
            audioBlob,
            `sos-${Date.now()}`
          );
        }
      }

      const response = await fetch("/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          audioTranscript: "Emergency alert - audio recording completed",
          audioUrl,
          audioBuffer: audioBuffer ? Array.from(audioBuffer) : null,
          volume,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAlertState({
          alertSent: true,
          isRecording: false,
          currentAlert: result.alert,
        });

        toast({
          title: "Alert Sent Successfully",
          description:
            "Emergency services and nearby users have been notified.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to send alert");
      }
    } catch (error) {
      toast({
        title: "Alert Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to send alert. Please try again or call security directly.",
        variant: "destructive",
      });
      setAlertState({ isRecording: false });
    } finally {
      // Cleanup audio handler
      if (audioHandlerRef.current) {
        audioHandlerRef.current.cleanup();
      }
    }
  };

  if (alert.alertSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-green-800">Alert Sent!</h3>
          <p className="text-green-600">Help is on the way</p>
          {alert.currentAlert && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Urgency Level:{" "}
                {Math.round(alert.currentAlert.urgencyScore * 100)}%
              </p>
              <p className="text-sm text-green-700">
                Category: {alert.currentAlert.category}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <Button
        size="lg"
        className={`w-48 h-48 rounded-full text-white font-bold text-xl transition-all duration-200 ${
          isPressed
            ? "bg-red-700 scale-95 shadow-inner"
            : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
        }`}
        onClick={handleSOSPress}
        disabled={alert.isRecording}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-3xl">SOS</span>
          {alert.isRecording && (
            <div className="flex items-center space-x-1">
              <Mic className="h-4 w-4 animate-pulse" />
              <span className="text-sm">{countdown}s</span>
            </div>
          )}
        </div>
      </Button>

      {alert.isRecording && (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <Mic className="h-5 w-5 animate-pulse" />
            <span>Recording audio...</span>
          </div>
          <div className="w-full bg-red-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((30 - countdown) / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-gray-600 text-sm max-w-md mx-auto">
        Your location and a 30-second audio recording will be sent to nearby
        users and security personnel.
      </p>
    </div>
  );
}
