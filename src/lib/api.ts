// src/lib/api.ts
const API_URL = "http://localhost:8080/api";

export interface Contact {
  id: number;
  phone: string;
  name: string | null;
  createdAt: string;
}

export interface Message {
  id: number;
  whatsappMessageId: string | null;
  contactPhone: string;
  body: string;
  fromMe: boolean;
  timestamp: string;
  createdAt: string;
}

export const api = {
  getContacts: async (): Promise<Contact[]> => {
    const res = await fetch(`${API_URL}/contacts`);
    if (!res.ok) throw new Error("Failed to fetch contacts");
    return res.json();
  },

  getMessagesByPhone: async (phone: string): Promise<Message[]> => {
    const res = await fetch(`${API_URL}/messages/phone/${phone}`);
    if (!res.ok) return []; // return empty if no messages
    return res.json();
  },
};