# Chat Application

A full-stack chat application with real-time messaging, theme support, and data visualization.

## Features

- Real-time chat messaging
- Multiple chat sessions
- Light/Dark mode
- Data tables in responses
- Responsive design

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router  
**Backend:** Express.js, Node.js

## Quick Start

### Prerequisites
- Node.js (v16+)
- npm

### Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```
Backend: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## Project Structure

```
├── backend/              # Express API server
│   ├── server.js        # Main server file
│   ├── mockData/        # Mock data
│   └── package.json
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Theme context
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/v1/sessions/new` - Create session
- `GET /api/v1/sessions` - List sessions
- `GET /api/v1/sessions/:sessionId/history` - Get chat history
- `POST /api/v1/sessions/:sessionId/question` - Send message

## Development

### Frontend Scripts
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint code
```

### Environment Setup

Create `.env` in backend:
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## License

MIT
