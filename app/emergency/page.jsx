"use client"

import { useState, useRef } from "react";
import { motion } from "framer-motion";

import ReactMarkdown from "react-markdown";


 function BotMessage({ content }) {
  return (
    <div className="p-3 rounded-xl bg-gray-100 text-gray-900">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

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
    <div className="min-h-screen grid self-center place-content-center items-center justify-center bg-orange-100 relative ">
      {/* Security Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-orange-200 animate-pulse"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,165,0,0.15) 1px, transparent 1px),
            linear-gradient(rgba(255,165,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 rounded-full border-2 border-orange-400 shadow-2xl">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-bold text-lg tracking-wider">EMERGENCY SECURITY SYSTEM</span>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8">
        {/* Emergency Button Section */}
        <div className="relative mb-12">
          {/* Outer Ring Animation */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-72 h-72 rounded-full border-4 border-red-400 -translate-x-8 -translate-y-8"
          ></motion.div>

          {/* Middle Ring */}
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2
            }}
            className="absolute inset-0 w-64 h-64 rounded-full border-3 border-orange-400 -translate-x-4 -translate-y-4"
          ></motion.div>

          {/* Emergency Button */}
          <motion.button
            onClick={handleSOS}
            disabled={isSending}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="relative w-56 h-56 rounded-full bg-red-600 text-white font-bold text-xl shadow-2xl border-4 border-red-400 disabled:opacity-70 flex flex-col items-center justify-center group overflow-hidden"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
            
            {/* Button Content */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {isSending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
                  ></motion.div>
                  <span className="text-lg font-black">SENDING SOS...</span>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-1">⚠️</div>
                  <span className="text-xl font-black tracking-wider">EMERGENCY</span>
                  <span className="text-sm opacity-90 font-semibold">PRESS & HOLD</span>
                </>
              )}
            </div>
          </motion.button>
        </div>

        {/* Emergency Alert Display */}
        {classificationState && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-2xl mb-8"
          >
            <div className="bg-white border-2 border-orange-300 rounded-2xl shadow-2xl overflow-hidden">
              {/* Alert Header */}
              <div className="bg-red-600 px-6 py-5 border-b-2 border-red-500">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-black text-white tracking-wide">
                    🚨 EMERGENCY ALERT DISPATCHED
                  </h2>
                  <div className="ml-auto text-xs bg-red-500 text-white px-3 py-2 rounded-full font-bold border border-white">
                    STATUS: ACTIVE
                  </div>
                </div>
              </div>

              {/* Alert Content */}
              <div className="p-6 space-y-6 bg-orange-50">
                {/* Threat Analysis */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-lg">
                    <h3 className="text-orange-600 font-black mb-4 text-sm tracking-wider uppercase border-b-2 border-orange-200 pb-2">
                      Threat Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-orange-800 font-semibold text-sm">Threat Label:</span>
                        <span className="text-red-600 font-black text-sm px-3 py-2 bg-red-100 rounded-lg border border-red-200">
                          {classificationState.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-800 font-semibold text-sm">Threat Confidence Score:</span>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-3 bg-orange-100 rounded-full overflow-hidden border border-orange-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${classificationState.score * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-orange-500 rounded-full"
                            ></motion.div>
                          </div>
                          <span className="text-red-600 font-black text-sm">
                            {Math.round(classificationState.score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Data */}
                  {location && (
                    <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-lg">
                      <h3 className="text-orange-600 font-black mb-4 text-sm tracking-wider uppercase border-b-2 border-orange-200 pb-2">
                        Location Data
                      </h3>
                      <div className="space-y-3 font-mono text-sm">
                        <div className="text-orange-800 font-semibold">
                          LAT: <span className="text-red-600 font-black">{location.lat.toFixed(6)}</span>
                        </div>
                        <div className="text-orange-800 font-semibold">
                          LNG: <span className="text-red-600 font-black">{location.lng.toFixed(6)}</span>
                        </div>
                        <div className="text-green-600 text-xs mt-3 flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-bold">GPS LOCK ACQUIRED</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Report */}
                {emergencyDescription && (
                  <div className="bg-orange-200 rounded-xl p-5 border-2 border-orange-300 shadow-lg">
                    <h3 className="text-orange-800 font-black mb-4 text-sm tracking-wider uppercase border-b-2 border-orange-400 pb-2">
                      Emergency Report
                    </h3>
                    <p className="text-orange-900 text-sm leading-relaxed font-medium">
                      {emergencyDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Interface */}
        <div className="w-full max-w-2xl">
          <div className="bg-white border-2 border-orange-300 rounded-2xl shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-orange-500 px-6 py-5 border-b-2 border-orange-400">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse border border-white"></div>
                <h3 className="text-lg font-black text-white tracking-wide">
                  SECURE AGENT COMMUNICATION
                </h3>
                <div className="ml-auto text-xs bg-orange-400 text-white px-3 py-2 rounded-full font-bold border border-white">
                  ENCRYPTED
                </div>
              </div>
            </div>
import ReactMarkdown from "react-markdown";

// ...

{/* Chat Messages */}
<div className="h-64 overflow-y-auto p-5 space-y-3 bg-orange-50">
  {chatMessages.length === 0 && (
    <div className="text-center text-orange-400 py-8 text-sm font-semibold">
      Secure communication channel ready...
    </div>
  )}
  {chatMessages.map((m, idx) => (
    <motion.div 
      key={idx} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${m.role === "human" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`px-4 py-3 rounded-xl max-w-[80%] text-sm shadow-lg font-medium ${
          m.role === "human" 
            ? "bg-orange-500 text-white rounded-br-md border border-orange-400" 
            : "bg-white text-orange-900 rounded-bl-md border-2 border-orange-200"
        }`}
      >
        {m.role === "human" ? (
          m.text
        ) : (
          <ReactMarkdown>{m.text}</ReactMarkdown>
        )}
      </div>
    </motion.div>
  ))}
</div>


            {/* Chat Input */}
            <div className="border-t-2 border-orange-300 p-5 bg-orange-100">
              <ChatInput onSend={sendChatMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Chat Input Component
function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex gap-3">
      <input
        className="flex-1 bg-white border-2 border-orange-300 rounded-xl px-4 py-3 text-sm text-orange-900 placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 focus:outline-none shadow-lg font-medium"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter secure message..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-orange-400 transition-all duration-200 font-black text-sm tracking-wide border border-orange-400"
      >
        SEND
      </motion.button>
    </div>
  );
}