# Backend Connection Guide

## Quick Setup

1. **Create `.env.local` file** in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

2. **Update the URL** if your backend runs on a different port or host:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```

3. **Start the backend server** (if not already running)

4. **Start the frontend**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Testing the Connection

### Check Backend Health
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "database": "Connected"
}
```

### Check Contacts Endpoint
```bash
curl http://localhost:8080/api/contacts
```

### Check Messages Endpoint
```bash
curl http://localhost:8080/api/messages
```

### Test Send Message
```bash
curl -X POST http://localhost:8080/api/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","message":"Test message"}'
```

## Troubleshooting

### Issue: "Failed to connect to backend" error

**Check:**
1. ✅ Backend server is running
2. ✅ Backend is accessible at the configured URL
3. ✅ `.env.local` file exists with correct `NEXT_PUBLIC_API_URL`
4. ✅ Next.js dev server was restarted after creating/modifying `.env.local`
5. ✅ CORS is enabled on backend for `http://localhost:3000`

### Issue: CORS errors in browser console

**Solution:** Enable CORS on your backend to allow requests from `http://localhost:3000`

Example for Spring Boot:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### Issue: Empty contacts list

**Check:**
1. Backend `/api/contacts` endpoint returns data
2. Check browser console for errors
3. Verify API URL is correct

### Issue: Messages not sending

**Check:**
1. Backend `/api/send` endpoint is working
2. WhatsApp Business API credentials are configured
3. Phone number format is correct
4. Check backend logs for errors

## Backend API Requirements

Your backend must provide these endpoints:

### GET `/api/contacts`
Returns array of contacts:
```json
[
  {
    "id": 1,
    "phone": "1234567890",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET `/api/messages`
Returns array of all messages:
```json
[
  {
    "id": 1,
    "whatsappMessageId": "wamid.xxx",
    "contactPhone": "1234567890",
    "body": "Hello!",
    "fromMe": false,
    "timestamp": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET `/api/messages/phone/{phone}`
Returns array of messages for a specific phone number.

### POST `/api/send`
Request body:
```json
{
  "phone": "1234567890",
  "message": "Hello from CRM!"
}
```

Response:
```json
{
  "success": true,
  "messageId": "wamid.xxx"
}
```

### GET `/api/health`
Health check endpoint (optional but recommended):
```json
{
  "status": "UP",
  "database": "Connected"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (must include `/api`) | `http://localhost:8080/api` |

**Important:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

## Production Setup

For production deployment:

1. Set the environment variable in your hosting platform (Vercel, Netlify, etc.)
2. Use your production backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```
3. Ensure CORS is configured to allow requests from your frontend domain
4. Ensure HTTPS is enabled for security

## Next Steps

Once connected:
- ✅ Contacts will auto-refresh every 10 seconds
- ✅ Messages will auto-refresh every 3 seconds
- ✅ You can send messages via the UI
- ✅ All messages and contacts sync with your backend database

For more information, see the main [README.md](README.md) file.
