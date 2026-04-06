// src/app/components/MessageModal.tsx
"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: number;
  farmName: string;
  farmerName: string;
  onMessageSent: () => void;
}

export default function MessageModal({ isOpen, onClose, farmId, farmName, farmerName, onMessageSent }: MessageModalProps) {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          message: message.trim(),
          subject: subject.trim() || `Inquiry about ${farmName}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("");
        setSubject("");
        onMessageSent();
        onClose();
        alert("Message sent successfully!");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-emerald-900">
            Message {farmerName}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm
            </label>
            <p className="text-emerald-600 font-medium">{farmName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`Inquiry about ${farmName}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={`Hi ${farmerName}, I'm interested in visiting your farm...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}