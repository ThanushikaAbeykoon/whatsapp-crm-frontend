// src/components/WhatsAppCRM.tsx   ← REPLACE EVERYTHING WITH THIS
"use client";

import { useState, useEffect, useRef } from "react";
import { api, type Contact, type Message } from "../lib/api";
import { Send, Phone, User, Clock } from "lucide-react";

export default function WhatsAppCRM() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasShownErrorRef = useRef(false);

  // Load contacts
  useEffect(() => {
    let isFirstLoad = true;
    const loadContacts = async () => {
      try {
        const data = await api.getContacts();
        setContacts(data);
        setLoading(false);
        setError(null);
        hasShownErrorRef.current = false; // Reset error flag on success
        isFirstLoad = false;
      } catch (err) {
        console.error("Failed to load contacts:", err);
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : "Failed to connect to backend";
        setError(errorMessage);
        // Show error to user only once on initial load failure
        if (isFirstLoad && !hasShownErrorRef.current) {
          hasShownErrorRef.current = true;
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
          alert(`Failed to connect to backend at ${apiUrl}.\n\nPlease ensure the backend server is running.\n\nError: ${errorMessage}`);
          isFirstLoad = false;
        }
      }
    };
    loadContacts();
    const interval = setInterval(loadContacts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load messages when contact changes
  useEffect(() => {
    if (!selectedContact) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const data = await api.getMessagesByPhone(selectedContact.phone);
      setMessages(data);
      scrollToBottom();
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000); // refresh every 3 seconds
    return () => clearInterval(interval);
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedContact || sending) return;

    const messageText = inputMessage.trim();
    setSending(true);
    setInputMessage("");
    
    const tempMessage: Message = {
      id: Date.now(),
      whatsappMessageId: null,
      contactPhone: selectedContact.phone,
      body: messageText,
      fromMe: true,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Show instantly (optimistic UI)
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    // Send to backend
    const result = await api.sendMessage({
      phone: selectedContact.phone,
      message: messageText,
    });

    setSending(false);

    if (!result.success) {
      // Remove the optimistic message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert(`Failed to send message: ${result.error || "Unknown error"}`);
    }
    // If successful, the message will be updated when we refresh messages
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-2xl text-gray-600">Loading WhatsApp CRM...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-green-600 text-white text-xl font-bold">WhatsApp CRM</div>
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            <div className="font-semibold">Connection Error</div>
            <div className="text-xs mt-1">{error}</div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${selectedContact?.phone === contact.phone ? "bg-green-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {contact.name ? contact.name[0].toUpperCase() : <Phone className="w-6 h-6" />}
                </div>
                <div>
                  <div className="font-medium">{contact.name || contact.phone}</div>
                  <div className="text-sm text-gray-500">{contact.phone}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="bg-green-600 text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">
                {selectedContact.name?.[0] || <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-medium">{selectedContact.name || selectedContact.phone}</div>
                <div className="text-sm opacity-90">{selectedContact.phone}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md px-4 py-2 rounded-lg ${msg.fromMe ? "bg-green-500 text-white" : "bg-white border"}`}>
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${msg.fromMe ? "text-green-100" : "text-gray-500"}`}>
                      <Clock className="w-3 h-3" />
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Box — NOW WORKING! */}
            <div className="bg-white border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !inputMessage.trim()}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" /> {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}