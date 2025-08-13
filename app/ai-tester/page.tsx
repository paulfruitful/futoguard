"use client";
import {Client} from "@gradio/client"
import React, { useState, useEffect } from "react";
import { recordAudio } from "@/src/AI/audiohandler";


export default function AITester() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [session, setSession] = useState<any>(null)

  function float32ToWavBuffer(float32Array:any, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  const writeString = (view:any, offset:any, str:any) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + float32Array.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // Linear quantization
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, float32Array.length * 2, true);

  // PCM samples
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



  const handleRecordAndClassify = async () => {
  try {
    setLoading(true);
    console.log("🎙 Recording...");
    const waveform = await recordAudio(30);

    if (!waveform || waveform.length === 0) {
      console.error("No audio captured");
      setLoading(false);
      return;
    }

    console.log("Recording complete, sending to FastAPI...");
    const result = await sendToGradio(waveform);

    console.log("Result from FastAPI:", result);

    setLoading(false);
  } catch (err) {
    console.error("Error during record/classify:", err);
    setLoading(false);
  }
};

/*
async function analyzeAudioFile(blobFile) {
  const formData = new FormData();
  formData.append("file", blobFile, "recording.wav");

  try {
    const response = await fetch("https://paulfruitful-aed-panic.hf.space/analyze-audio", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error(HTTP error! status: ${response.status});
    }
    const result = await response.json();
    console.log("API result:", result);
    return result;
  } catch (err) {
    console.error("Error fetching API:", err);
  }
}
*/

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Audio Tester</h1>
      <button onClick={handleRecordAndClassify} disabled={loading}>
        {loading ? "Recording..." : "Record & Classify"}
      </button>

      {results && (
        <div style={{ marginTop: 20 }}>
          <h2>Results</h2>
          <p>Danger Detected: {results.dangerDetected ? "✅ YES" : "❌ NO"}</p>
          {results.dangerDetected && (
            <pre>{JSON.stringify(results.dangerDetails, null, 2)}</pre>
          )}
          <h3>Top Predictions</h3>
          <ul>
            {results.allPredictions.slice(0, 5).map((p: any, idx: number) => (
              <li key={idx}>
                {p.label}: {(p.score * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
