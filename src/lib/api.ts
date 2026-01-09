// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://whatsapp-crm-production.up.railway.app/api";

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

export interface SendMessageRequest {
  phone: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface HealthCheck {
  status: string;
  database?: string;
  timestamp?: string;
}

export const api = {
  /**
   * Get all contacts from the backend
   */
  getContacts: async (): Promise<Contact[]> => {
    try {
      const res = await fetch(`${API_URL}/contacts`);
      if (!res.ok) {
        throw new Error(`Failed to fetch contacts: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  /**
   * Get all messages from the backend
   */
  getAllMessages: async (): Promise<Message[]> => {
    try {
      const res = await fetch(`${API_URL}/messages`);
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  /**
   * Get messages for a specific phone number
   */
  getMessagesByPhone: async (phone: string): Promise<Message[]> => {
    try {
      const res = await fetch(`${API_URL}/messages/phone/${encodeURIComponent(phone)}`);
      if (!res.ok) {
        if (res.status === 404) {
          return []; // No messages found
        }
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error fetching messages by phone:", error);
      return []; // Return empty array on error to prevent UI breaking
    }
  },

  /**
   * Send a message to a phone number via WhatsApp
   */
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    try {
      const res = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || `Failed to send message: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  /**
   * Check backend health and database connectivity
   */
  checkHealth: async (): Promise<HealthCheck> => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) {
        throw new Error(`Health check failed: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  },
};