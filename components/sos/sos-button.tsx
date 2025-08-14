"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mic, CheckCircle, MicOff, Play, Pause, RotateCcw, Send } from "lucide-react";
import { recordAudio } from "@/src/AI/audiohandler";
import { transcribeAudio } from "@/src/AI/transcriptionHandler";

interface SOSButtonProps {
  userId: string;
}

type RecordingState = "idle" | "recording" | "preview" | "sending" | "sent";

export function SOSButton({ userId }: SOSButtonProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [countdown, setCountdown] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const { location, alert, setAlertState, setLocation } = useAppStore();
  const { toast } = useToast();
  const audioHandlerRef = useRef<any | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [audioClassification, setAudioSetClassification]= useState()

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

  // Recording countdown and duration tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === "recording") {
      interval = setInterval(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;
          setRecordingDuration(30 - newCount);

          // Auto-stop at 30 seconds
          if (newCount <= 0) {
            handleStopRecording(true);
          }

          return newCount;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // Cleanup audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

      function float32ToWavBuffer(float32Array: Float32Array, sampleRate = 16000) {
      const buffer = new ArrayBuffer(44 + float32Array.length * 2);
      const view = new DataView(buffer);
      // WAV header
      const writeString = (view: DataView, offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };
      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + float32Array.length * 2, true);
      writeString(view, 8, "WAVE");
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, "data");
      view.setUint32(40, float32Array.length * 2, true);
      let offset = 44;
      for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      return buffer;
    }

  
  async function sendToGradio(float32Array: any) {
  const wavBuffer = float32ToWavBuffer(float32Array, 16000);
  const blob = new Blob([wavBuffer], { type: "audio/wav" });

  // Convert blob to base64 or ArrayBuffer to send
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = Array.from(new Uint8Array(arrayBuffer));

  const res = await fetch("/api/audio-detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBuffer: uint8Array }),
  });

  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return await res.json();
}





  const handleSOSPress = async () => {
    if (!location.latitude || !location.longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location services to send an alert.",
        variant: "destructive",
      });
      return;
    }
    try {
      setRecordingState("recording");
      setCountdown(30);
      setRecordingDuration(0);
      setAlertState({ isRecording: true });
      toast({
        title: "Recording Started",
        description: "Recording audio... Tap 'Stop' to finish early.",
      });
      // Start recording using recordAudio
      const audioBuffer = await recordAudio(30);
      // Convert Float32Array to WAV Blob
      const wavBuffer = float32ToWavBuffer(audioBuffer, 16000);
      const audioBlob = new Blob([wavBuffer], { type: "audio/wav" });
      setRecordedAudio(audioBlob);
      setAudioUrl(URL.createObjectURL(audioBlob));
      setRecordingState("preview");
      setRecordingDuration(30);
      // Send audio for classification
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = Array.from(new Uint8Array(arrayBuffer));
      const response = await fetch("/api/auto-detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ audioBuffer: Array.from(new Uint8Array(wavBuffer)) })
      });
      if (!response.ok) {
        throw new Error("Classification error: " + response.status);
      }
      const classificationResult = await response.json();
      setClassification(classificationResult);
      // Trigger alert if classification indicates high risk
      if (classificationResult && classificationResult.classifications) {
        const highRiskClasses = ['gunshot', 'gun', 'explosion', 'scream', 'panic'];
        const threshold = 0.7;
        const highRisk = classificationResult.classifications.find(
          (c: any) => highRiskClasses.includes(c.className.toLowerCase()) && c.probability >= threshold
        );
        if (highRisk) {
          await fetch("/api/alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: location.latitude,
              longitude: location.longitude,
              category: highRisk.className,
              urgencyScore: highRisk.probability,
              classification: classificationResult,
              source: "sos-button"
            })
          });
          toast({
            title: "High-Risk Alert Sent",
            description: `Detected ${highRisk.className} with confidence ${Math.round(highRisk.probability * 100)}%`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Audio init error:", error);
      toast({
        title: "Recording Error",
        description: "Unable to start audio recording or classify audio. Please check microphone permissions.",
        variant: "destructive",
      });
      setRecordingState("idle");
    }
  };

  const handleStopRecording = async (autoStopped: boolean) => {
    // No-op since recordAudio is one-shot
  };

  const processAndSendAlert = async (
    audioBlob: Blob,
    audioBuffer: Float32Array,
    result: AudioRecordingResult
  ) => {
    if (!audioHandlerRef.current) return;

    setRecordingState("sending");

    try {
      // Send audio to AI
      const aiResponse = await fetch("/api/ai/process-audio", {
        method: "POST",
        body: JSON.stringify({
          audioBuffer: Array.from(audioBuffer),
          duration: result.duration,
          volume: result.volume,
        }),
      });
      const { transcript, category, urgencyScore } = await aiResponse.json();

      // Upload audio and send alert
      const audioUploadUrl =
        await audioHandlerRef.current.uploadAudioToFirebase(
          audioBlob,
          `sos-${Date.now()}`
        );

      const alertResponse = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          audioTranscript: transcript,
          audioUrl: audioUploadUrl,
          audioBuffer: Array.from(audioBuffer),
          volume: result.volume,
          recordingDuration: result.duration,
          category,
          urgencyScore,
        }),
      });

      if (!alertResponse.ok) throw new Error("Failed to send alert");
      const alertData = await alertResponse.json();

      setAlertState({
        alertSent: true,
        isRecording: false,
        currentAlert: alertData.alert,
      });

      setRecordingState("sent");

      toast({
        title: "Emergency Alert Sent",
        description: `AI analysis complete. Help is on the way.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "SOS Failed",
        description:
          error instanceof Error ? error.message : "Failed to process audio.",
        variant: "destructive",
      });
      setRecordingState("idle");
    } finally {
      audioHandlerRef.current?.cleanup();
    }
  };

  const handlePlayPause = () => {
    if (!audioElementRef.current || !audioUrl) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleRetryRecording = () => {
    // Cleanup previous recording
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordedAudio(null);
    setRecordingState("idle");
    setRecordingDuration(0);
  };

  const handleSendAlert = async () => {
    if (!recordedAudio) return;
    setRecordingState("sending");
    try {
      if (audioHandlerRef.current) {
        // Convert audio to Float32Array for AI analysis
        const audioBuffer = await audioHandlerRef.current.blobToFloat32Array(recordedAudio);
        const result = {
          duration: recordingDuration,
          volume: audioHandlerRef.current.getCurrentVolume(),
        };
        await processAndSendAlert(recordedAudio, audioBuffer, result);
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
      setRecordingState("preview");
    } finally {
      if (audioHandlerRef.current) {
        audioHandlerRef.current.cleanup();
      }
    }
  };

  // Success state
  if (recordingState === "sent") {
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
              <p className="text-sm text-green-700">
                Recording Duration: {recordingDuration}s
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Audio preview state
  if (recordingState === "preview") {
    return (
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <Mic className="h-16 w-16 text-blue-600" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Recording Complete
          </h3>
          <p className="text-gray-600">Duration: {recordingDuration} seconds</p>
        </div>

        {/* Audio Preview Card */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
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
                <div className="text-sm text-gray-600 mb-1">Audio Preview</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Hidden audio element */}
            {audioUrl && (
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleRetryRecording}
            className="flex items-center space-x-2 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Record Again</span>
          </Button>

          <Button
            onClick={handleSendAlert}
            disabled={recordingState === "sending"}
            className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>
              {recordingState === "sending" ? "Sending..." : "Send Alert"}
            </span>
          </Button>
        </div>

        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Review your recording and send the emergency alert to nearby users and
          security personnel.
        </p>
      </div>
    );
  }

  // Recording state
  if (recordingState === "recording") {
    return (
      <div className="text-center space-y-6">
        <div className="w-48 h-48 mx-auto bg-red-600 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-4 border-4 border-red-300 rounded-full animate-pulse" />
          <div className="flex flex-col items-center space-y-2 text-white">
            <Mic className="h-12 w-12 animate-pulse" />
            <span className="text-2xl font-bold">{countdown}s</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span className="font-medium">Recording in progress...</span>
          </div>

          <div className="w-full max-w-md mx-auto bg-red-200 rounded-full h-3">
            <div
              className="bg-red-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${(recordingDuration / 30) * 100}%` }}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => handleStopRecording(false)}
            className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <MicOff className="h-4 w-4" />
            <span>Stop Recording</span>
          </Button>
        </div>

        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Recording audio for emergency alert. You can stop early or let it
          record for the full 30 seconds.
        </p>
      </div>
    );
  }

  // Initial state
  return (
    <div className="text-center space-y-6">
      <Button
        size="lg"
        className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        onClick={handleSOSPress}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-3xl">SOS</span>
          <Mic className="h-6 w-6" />
        </div>
      </Button>

      <p className="text-gray-600 text-sm max-w-md mx-auto">
        Press to start recording a 30-second audio message. Your location and
        audio will be sent to nearby users and security personnel.
      </p>
    </div>
  );
}
