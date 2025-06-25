# 🚀 Chat App

<div align="center">
  <p><em>Modern real-time chat application with direct messaging, group chat, file uploads, and push notifications</em></p>
</div>

## 🌐 Live Application

Access the live deployment here: [https://chat-app-gmm5.vercel.app/](https://chat-app-gmm5.vercel.app/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## ✨ Features

- 📱 Responsive UI (desktop & mobile)
- 🔐 Secure authentication (JWT)
- 💬 Direct messaging
- 👥 Group chats
- 📤 File uploads (PDF, images, etc.)
- 🔔 Real-time push notifications
- 🏗️ Modern architecture (Controller-Service-Repository)

## 🛠️ Tech Stack

### Frontend

- **React** (Vite, Zustand, Tailwind CSS, React Router, Firebase, Framer Motion, Radix UI)
- **Port:** `5173` (http://localhost:5173)

### Backend

- **Node.js** (Express, Prisma, MongoDB, JWT, Firebase Admin, bcrypt)
- **Port:** `8000` (http://localhost:8000)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB database

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kalp9197/chat-app.git
   cd chat-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   Create `.env` files in both `backend/` and `frontend/`:

   **backend/.env**

   ```env
   DATABASE_URL="your_mongodb_connection_string"
   JWT_SECRET="your_jwt_secret"
   PORT=8000
   CORS_ORIGIN="http://localhost:5173"
   ORIGIN_URL="http://localhost:5173"
   ```

   **frontend/.env**

   ```env
   VITE_API_URL="http://localhost:8000/api/v1"
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_domain.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   VITE_FIREBASE_VAPID_KEY="your_vapid_key"
   ```

4. **Database setup**

   ```bash
   cd backend
   npm run migrate
   ```

5. **Start development servers**

   ```bash
   # In the root directory
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

   Or start individually:

   ```bash
   npm run dev:backend    # backend only (port 8000)
   npm run dev:frontend   # frontend only (port 5173)
   ```

## 🏗️ Project Structure

```
chat-app/
├── backend/                # Backend server code
│   ├── prisma/             # Database schema and migrations
│   ├── src/                # Source code
│   │   ├── config/         # Configuration files
│   │   ├── constants/      # Constants and enums
│   │   ├── controllers/    # Request handlers
│   │   ├── errors/         # Error handling
│   │   ├── middlewares/    # Express middlewares
│   │   ├── repositories/   # Database access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── validations/    # Request validation
│   └── package.json        # Backend dependencies
├── frontend/               # Frontend application
│   ├── public/             # Public assets
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── config/         # Configuration files
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json        # Frontend dependencies
└── package.json            # Root dependencies and scripts
```

## 📋 Available Scripts

- `npm run dev` - Start both frontend (5173) and backend (8000) in development mode
- `npm run dev:backend` - Start only the backend
- `npm run dev:frontend` - Start only the frontend
- `npm run lint` - Run linting on both projects
- `npm run build:frontend` - Build the frontend for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
