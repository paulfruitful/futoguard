"use client"

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function EmergencySOS() {
  const [classificationState, setClassificationState] = useState(null);
  const [emergencyDescription, setEmergencyDescription] = useState(null);
  const [location, setLocation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isSending, setIsSending] = useState(false);

  // Get user location
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  };

  // Record 10s audio and send to API
  const handleSOS = async () => {
    try {
      setIsSending(true);
      fetchLocation();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
mediaRecorderRef.current = new MediaRecorder(stream);
audioChunksRef.current = [];

mediaRecorderRef.current.ondataavailable = (event) => {
  if (event.data.size > 0) {
    audioChunksRef.current.push(event.data);
  }
};

mediaRecorderRef.current.start();

setTimeout(async () => {
  mediaRecorderRef.current.stop();

  mediaRecorderRef.current.onstop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Array.from(new Uint8Array(arrayBuffer)); // serialize

    // Step 1: Send audio for classification (send JSON not FormData)
    const res = await fetch("/api/auto-detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBuffer: buffer }),
    });

    const classification = await res.json();
    
    // Step 2: Send to emergency endpoint
    const emergencyRes = await fetch("/api/emergency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classification,
        location,
      }),
    });
    const emergencyData = await emergencyRes.json();
    setEmergencyDescription(emergencyData.description);
    setClassificationState(classification.data[0].clipwise_results[0]);


    setIsSending(false);
  };
}, 10000); // 10s
 // 10s
    } catch (err) {
      console.error("Error in SOS flow", err);
      setIsSending(false);
    }
  };

  // Chat with agents
  const sendChatMessage = async (message) => {
    const newMessages = [...chatMessages, { role: "human", text: message }];
    setChatMessages(newMessages);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages.map((m) => [m.role, m.text]) }),
    });
    const data = await res.json();

    setChatMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
  };

  return (
    <div className="min-h-[160vh] bg-gradient-to-br from-orange-50 to-orange-200 flex flex-col items-center justify-center p-6">
      {/* Emergency Button */}
      <motion.button
        onClick={handleSOS}
        disabled={isSending}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-56 h-56 rounded-full bg-red-600 text-white font-bold text-2xl shadow-2xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
      >
        {isSending ? "Sending SOS..." : "Start An SOS"}
      </motion.button>

      {/* Emergency Display */}
      {classificationState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 w-full max-w-lg rounded-2xl shadow-xl bg-white border border-orange-300"
        >
          <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
            🚨 Emergency Alert Sent
          </h2>
          <p className="mt-3 text-sm text-gray-700 flex-col flex">
            <strong>Threat Classification:</strong>
            <ul>
              <li className="font-bold">Label: {classificationState.label}</li>
              <li className="font-bold">Score: {classificationState.score}</li>
            </ul>
          </p>
          {emergencyDescription && (
            <p className="mt-2 text-sm text-gray-700">
              <strong>Emergency Report:</strong> {emergencyDescription}
            </p>
          )}
          {location && (
            <p className="mt-2 text-sm text-gray-700">
              <strong>Location:</strong> {location.lat}, {location.lng}
            </p>
          )}
        </motion.div>
      )}

      {/* Chat Session */}
      <div className="mt-10 w-full max-w-lg bg-white rounded-2xl shadow-lg border border-orange-200 flex flex-col">
        <h3 className="px-4 py-3 text-lg font-semibold text-white bg-orange-500 rounded-t-2xl">
          Chat with Agent
        </h3>
        <div className="mt-2 h-72 overflow-y-auto px-4 py-2 space-y-2 bg-orange-50">
          {chatMessages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "human" ? "justify-end" : "justify-start"}`}>
              <span
                className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow ${m.role === "human" ? "bg-orange-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"}`}
              >
                {m.text}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-orange-200 p-3">
          <ChatInput onSend={sendChatMessage} />
        </div>
      </div>
    </div>
  );
}

// Separate Chat Input Component
function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button className="bg-orange-500 text-white px-5 py-2 rounded-xl shadow hover:bg-orange-600">
        Send
      </button>
    </form>
  );
}
