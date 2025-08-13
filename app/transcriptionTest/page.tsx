"use client";

import React, { useState, useRef } from "react";
import { transcribeAudio } from "@/src/AI/transcriptionHandler";

export default function TranscriptionTest() {
  const [status, setStatus] = useState("Idle");
  const [transcript, setTranscript] = useState("");
  const audioDataRef = useRef<Float32Array[]>([]);
  const sampleRate = 16000;

  const startRecording = async () => {
    setStatus("Recording...");
    audioDataRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext({ sampleRate });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      audioDataRef.current.push(new Float32Array(input));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    // Stop after 10 seconds
    setTimeout(() => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      const merged = mergeBuffers(audioDataRef.current);
      sendToTranscription(merged);
    }, 10000);
  };

  const mergeBuffers = (buffers: Float32Array[]) => {
    let length = 0;
    buffers.forEach((b) => (length += b.length));
    const merged = new Float32Array(length);
    let offset = 0;
    buffers.forEach((b) => {
      merged.set(b, offset);
      offset += b.length;
    });
    return merged;
  };

  const sendToTranscription = async (finalAudio: Float32Array) => {
    setStatus("Transcribing...");
    const text = await transcribeAudio(finalAudio, sampleRate);
    setTranscript(text);
    setStatus("Done");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🎙️ Transcription Test</h1>
      <button onClick={startRecording} className="bg-blue-500 text-white px-4 py-2 rounded">
        Start Recording (30s)
      </button>
      <p className="mt-4">Status: {status}</p>
      {transcript && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
