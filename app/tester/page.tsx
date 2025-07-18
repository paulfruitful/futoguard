"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Declare tmAudio as globally available (loaded via script)
declare global {
  interface Window {
    tmAudio: any;
  }
}

export default function Tester() {
  const [label, setLabel] = useState("Listening...");
  const [isListening, setIsListening] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [mic, setMic] = useState<any>(null);

  useEffect(() => {
    // Add favicon link
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = "/favicon.ico";
    favicon.type = "image/x-icon";
    document.head.appendChild(favicon);

    return () => {
      document.head.removeChild(favicon);
    };
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@teachablemachine/sound@0.8.4/dist/teachablemachine-sound.min.js";
        script.async = true;

        script.onload = async () => {
          if (!window.tmAudio) {
            console.error("tmAudio not available");
            return;
          }

          const URL = "/models/";
          const loadedModel = await window.tmAudio.load(
            URL + "model.json",
            URL + "metadata.json"
          );
          setModel(loadedModel);

          const microphone = new window.tmAudio.Microphone();
          await microphone.setup();
          setMic(microphone);
          setLabel("Ready! Click Start Listening");
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading model or mic:", error);
        setLabel("❌ Error initializing mic or model.");
      }
    };

    loadModel();

    return () => {
      // Cleanup
      if (mic) {
        mic.stop();
      }
    };
  }, []);

  const startListening = async () => {
    if (!model || !mic) {
      setLabel("Model or microphone not ready");
      return;
    }

    try {
      await mic.play();
      setIsListening(true);

      model.listen(mic, 500, async () => {
        const prediction = await model.predict();
        const top = prediction.reduce((prev: any, current: any) =>
          prev.probability > current.probability ? prev : current
        );
        setLabel(
          `${top.className} (${(top.probability * 100).toFixed(1)}%)`
        );
      });
    } catch (error) {
      console.error("Error starting listening:", error);
      setLabel("❌ Error starting microphone.");
    }
  };

  const stopListening = () => {
    if (mic) {
      mic.stop();
      setIsListening(false);
      setLabel("Stopped listening");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700">
            🎧 Audio Emotion Detection Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <p className="mt-4 text-green-600 text-lg font-mono">{label}</p>
            <div className="flex gap-4">
              {!isListening ? (
                <Button onClick={startListening} disabled={!model || !mic}>
                  Start Listening
                </Button>
              ) : (
                <Button onClick={stopListening} variant="destructive">
                  Stop Listening
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}