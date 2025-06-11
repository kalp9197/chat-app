# 🚀 Chat App

<div align="center">
  <p><em>Modern real-time chat application with direct messaging and group chat capabilities</em></p>

## Live Application

Access the live deployment here: [https://chat-app-gmm5.vercel.app/](https://chat-app-gmm5.vercel.app/)



[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

## ✨ Features

- **📱 Responsive UI**: Works seamlessly on desktop and mobile
- **🔒 Authentication**: Secure user registration and login
- **💬 Direct Messaging**: Send private messages to other users
- **👥 Group Chats**: Create and manage group conversations
- **🔔 Push Notifications**: Real-time notifications for new messages
- **📂 Modern Architecture**: Controller-Service-Repository pattern in backend

## 🛠️ Tech Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Firebase** - Push notifications

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **MongoDB** - Database
- **JWT** - Authentication
- **Firebase Admin** - Push notifications

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB database

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/kalp9197/chat-app.git
cd chat-app
```

2. **Install dependencies**

```bash
npm run install-all
# or
yarn install-all
```

3. **Environment setup**

Create `.env` files in both `backend` and `frontend` directories:

For backend:

```
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=8000
CORS_ORIGIN="http://localhost:5173"
```

For frontend:

```
VITE_API_URL="http://localhost:8000/api/v1"
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_domain.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
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

This will start both frontend and backend servers concurrently.

## 🏗️ Project Structure

```
chat-app/
├── backend/                # Backend server code
│   ├── prisma/             # Database schema and migrations
│   ├── src/                # Source code
│   │   ├── config/         # Configuration files
│   │   ├── constants/      # Constants and enums
│   │   ├── controllers/    # Request handlers
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

- `npm run dev` - Start both frontend and backend in development mode
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
