import axios from "axios";
import { float32ToWav } from "@/src/Utils/audioUtils";

export async function transcribeAudio(audioData: Float32Array, sampleRate: number): Promise<string> {
  try {
    // Convert Float32Array to WAV Blob
    const wavBlob = float32ToWav(audioData, sampleRate);
    const arrayBuffer = await wavBlob.arrayBuffer();
    const audioBuffer = new Uint8Array(arrayBuffer);

    // Send audio to backend API
    const response = await axios.post("/api/transcriptionHandler", audioBuffer, {
      headers: {
        "Content-Type": "application/octet-stream"
      }
    });
    return response.data.text || "";
  } catch (err) {
    console.error("Transcription error:", err);
    return "Error transcribing audio.";
  }
}
