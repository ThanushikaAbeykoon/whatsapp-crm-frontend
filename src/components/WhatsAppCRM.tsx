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
      <div className="flex items-center justify-center h-screen bg-emerald-900 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
        <div className="rounded-2xl bg-white/95 px-8 py-6 shadow-2xl">
          <div className="text-center text-2xl font-semibold text-emerald-800">
            Loading WhatsApp CRM...
          </div>
          <div className="mt-2 text-center text-sm text-emerald-600">
            Connecting to your WhatsApp backend. Please wait.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-emerald-900 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-r border-black/10 bg-emerald-950/70 backdrop-blur-md">
        <div className="border-b border-emerald-900 bg-emerald-700/90 px-4 py-3 text-lg font-semibold text-white shadow-md">
          WhatsApp CRM
        </div>
        {error && (
          <div className="border-b border-red-500/40 bg-red-900/60 px-3 py-2 text-sm text-red-100">
            <div className="font-semibold">Connection error</div>
            <div className="mt-1 text-xs opacity-90">{error}</div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto bg-emerald-950/40">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`cursor-pointer border-b border-emerald-900/60 px-4 py-3 text-sm transition-colors hover:bg-emerald-900/80 ${
                selectedContact?.phone === contact.phone
                  ? "bg-emerald-800/80"
                  : "bg-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-md">
                  {contact.name ? (
                    contact.name[0].toUpperCase()
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-emerald-50">
                    {contact.name || contact.phone}
                  </div>
                  <div className="text-xs text-emerald-200/80">{contact.phone}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedContact ? (
          <>
            <div className="flex items-center gap-3 border-b border-black/10 bg-emerald-700/90 px-5 py-3 text-white shadow-md backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-emerald-700 shadow-md">
                {selectedContact.name?.[0] || <User className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {selectedContact.name || selectedContact.phone}
                </div>
                <div className="text-xs opacity-90">{selectedContact.phone}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_#ffffff_0,_#e5ddd5_55%,_#d1c4a6_100%)] px-6 py-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md rounded-lg px-4 py-2 text-sm shadow-sm ${
                      msg.fromMe
                        ? "bg-[#dcf8c6] text-emerald-950"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    <div
                      className={`mt-1 flex items-center gap-1 text-[11px] ${
                        msg.fromMe ? "text-emerald-900/70" : "text-gray-500"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Box */}
            <div className="border-t border-black/5 bg-[#f0f0f0]/95 px-4 py-3 shadow-inner backdrop-blur">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !inputMessage.trim()}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_#ffffff_0,_#e5ddd5_55%,_#d1c4a6_100%)]">
            <div className="rounded-xl bg-white/90 px-8 py-6 text-center text-gray-700 shadow-xl">
              <div className="text-lg font-semibold">Welcome to WhatsApp CRM</div>
              <div className="mt-2 text-sm text-gray-500">
                Select a contact from the list on the left to view and send messages.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}