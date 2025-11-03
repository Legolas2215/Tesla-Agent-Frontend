# Tesla AI Assistant

A sleek, modern web application for querying Tesla's 2024 Annual Report (10-K) using AI-powered chat interface.

## Features

- 🔐 **Secure Authentication**: JWT-based login system
- 💬 **Real-time Streaming Chat**: SSE-powered responses with token-by-token updates
- 📄 **Section Filtering**: Focus queries on specific sections of the report
- 📖 **Citation Display**: See exact page numbers and sections for AI responses
- 🎨 **Tesla-inspired Design**: Minimalist, futuristic UI with glass morphism
- ♿ **Accessible**: WCAG AA compliant with keyboard navigation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Routing**: React Router v6
- **UI Components**: shadcn/ui + Radix UI
- **HTTP**: Native fetch API + EventSource for SSE

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see API configuration below)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-directory>

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root:
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for the backend API (e.g., `http://localhost:8000`)

## API Integration

### Required Backend Endpoints

1. **POST /api/login**
   - Authenticates user and returns JWT token
   - Body: `{ "email": "string", "password": "string" }`
   - Response: `{ "token": "string", "user": { "id": "string", "email": "string" } }`

2. **GET /api/chat/stream** (SSE streaming, preferred)
   - Query params: `message`, `sections` (comma-separated), `top_k`, `conversation_id`
   - Returns Server-Sent Events with tokens and citations
   - Auth: Bearer token

3. **POST /api/chat** (non-streaming fallback)
   - Body: `{ "message": "string", "sections": ["string"], "top_k": number, "conversation_id": "string" }`
   - Response: `{ "answer": "string", "citations": [...], "messageId": "string" }`
   - Auth: Bearer token

### Static Assets

- `/public/table_of_contents.json`: List of report sections for filtering

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInput.tsx       # Message composer
│   │   ├── Message.tsx         # Message display
│   │   ├── MessageList.tsx     # Chat history
│   │   └── SectionFilter.tsx   # Section multi-select
│   ├── ui/                     # shadcn components
│   └── ProtectedRoute.tsx      # Auth guard
├── contexts/
│   └── AuthContext.tsx         # Auth state management
├── lib/
│   ├── api.ts                  # API client
│   └── utils.ts                # Utilities
├── pages/
│   ├── Login.tsx               # Login page
│   ├── Chat.tsx                # Chat interface
│   └── NotFound.tsx            # 404 page
├── types/
│   └── api.ts                  # TypeScript types
├── index.css                   # Design system
└── App.tsx                     # App root
```

## Key Features Explained

### Streaming Chat

The application uses Server-Sent Events (SSE) for real-time streaming responses:
- Tokens arrive incrementally for a natural typing effect
- Cancel button allows stopping mid-generation
- Automatic fallback to non-streaming if SSE fails

### Section Filtering

Users can scope their queries to specific sections of the 10-K:
- Multi-select dropdown populated from `table_of_contents.json`
- Filters are sent as query parameters to the API
- Visual indicator shows number of active filters

### Authentication

- JWT tokens stored in memory and localStorage
- Automatic token injection in all API requests
- 401 responses trigger redirect to login
- Secure logout clears all auth state

### Design System

Custom Tesla-inspired design tokens in `index.css`:
- Dark theme with high contrast
- Red accent color (Tesla brand)
- Glass morphism effects
- Smooth animations and transitions

## Development

```bash
# Run dev server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production-ready static files

3. Deploy to any static hosting service (Vercel, Netlify, etc.)

4. Set the `VITE_API_BASE_URL` environment variable to your production API URL

## Accessibility

- Semantic HTML structure
- ARIA labels and live regions
- Keyboard navigation support (Enter to send, Shift+Enter for newline)
- High contrast colors
- Focus indicators

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
