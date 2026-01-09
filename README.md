# WhatsApp CRM Frontend

A modern Next.js frontend for the WhatsApp CRM system that connects to your backend API to manage contacts and messages.

## Features

- 📱 View all WhatsApp contacts
- 💬 Real-time message display with auto-refresh
- ✉️ Send messages through WhatsApp Business API
- 🎨 Modern, WhatsApp-like UI design
- 🔄 Automatic polling for new messages and contacts
- ⚠️ Error handling and connection status indicators

## Prerequisites

- Node.js 18+ installed
- Backend server running (see Backend Connection below)
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Backend Connection

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Important:** 
- For local development, use `http://localhost:8080/api` (default)
- For production, replace with your actual backend URL (e.g., `https://your-backend.com/api`)
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser

### 3. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Backend Connection

### Backend API Endpoints

The frontend expects the following backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contacts` | GET | Get all contacts |
| `/api/messages` | GET | Get all messages |
| `/api/messages/phone/{phone}` | GET | Get messages for a specific phone number |
| `/api/send` | POST | Send a WhatsApp message |
| `/api/health` | GET | Health check endpoint |

### Expected Backend Response Formats

#### Contact
```json
{
  "id": 1,
  "phone": "1234567890",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Message
```json
{
  "id": 1,
  "whatsappMessageId": "wamid.xxx",
  "contactPhone": "1234567890",
  "body": "Hello!",
  "fromMe": false,
  "timestamp": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Send Message Request
```json
{
  "phone": "1234567890",
  "message": "Hello from CRM!"
}
```

#### Send Message Response
```json
{
  "success": true,
  "messageId": "wamid.xxx"
}
```

### Testing Backend Connection

1. **Start your backend server** (typically on `http://localhost:8080`)

2. **Check health endpoint:**
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Verify contacts endpoint:**
   ```bash
   curl http://localhost:8080/api/contacts
   ```

4. **Open the frontend** at `http://localhost:3000`

5. **Check for errors:**
   - If the backend is not running, you'll see a connection error alert
   - Check the browser console (F12) for detailed error messages
   - Check the sidebar for a red error banner if connection fails

## Troubleshooting

### Frontend can't connect to backend

**Symptoms:** Error message in UI, empty contacts list, red error banner

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. Check `.env.local` file exists and has correct URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

3. Restart Next.js dev server after changing `.env.local`

4. Check CORS settings on backend - ensure it allows requests from `http://localhost:3000`

5. Verify backend is accessible at the configured URL

### Messages not appearing

**Symptoms:** Contacts show but no messages when selected

**Solutions:**
1. Check browser console for errors
2. Verify backend `/api/messages/phone/{phone}` endpoint works:
   ```bash
   curl http://localhost:8080/api/messages/phone/1234567890
   ```
3. Check if messages exist in backend database
4. Messages auto-refresh every 3 seconds - wait a moment

### Messages not sending

**Symptoms:** Send button doesn't work, message disappears after sending

**Solutions:**
1. Check browser console for errors
2. Verify backend `/api/send` endpoint works:
   ```bash
   curl -X POST http://localhost:8080/api/send \
     -H "Content-Type: application/json" \
     -d '{"phone":"1234567890","message":"Test"}'
   ```
3. Check backend logs for WhatsApp API errors
4. Verify WhatsApp Business API credentials are configured correctly

## Project Structure

```
whatsapp-crm-frontend/
├── src/
│   ├── app/
│   │   └── page.tsx          # Main page component
│   ├── components/
│   │   └── WhatsAppCRM.tsx   # Main CRM component
│   └── lib/
│       └── api.ts            # API client and types
├── .env.local                # Environment variables (create this)
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api` |

## Features Overview

### Auto-Refresh
- Contacts refresh every 10 seconds
- Messages refresh every 3 seconds when a contact is selected

### Optimistic UI
- Messages appear instantly when sending (optimistic update)
- If send fails, message is removed and error is shown

### Error Handling
- Connection errors displayed in sidebar
- Send errors shown via alert
- Graceful degradation when backend is unavailable

## Development

### Making Changes

The main components are:
- `src/components/WhatsAppCRM.tsx` - Main UI component
- `src/lib/api.ts` - API client with all backend interactions

### Adding New Features

1. Add new API endpoints to `src/lib/api.ts`
2. Update types/interfaces as needed
3. Use the API functions in components

## Production Deployment

1. Update `.env.local` or set environment variable `NEXT_PUBLIC_API_URL` to your production backend URL
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

Or deploy to Vercel/Netlify and set the environment variable in their dashboard.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is part of the WhatsApp CRM system.
