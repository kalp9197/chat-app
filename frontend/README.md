# 🚀 Chat App - Frontend

<div align="center">
  <p><em>Modern React frontend with Vite, Tailwind CSS, and real-time messaging</em></p>
</div>

## 📋 Overview

This is the frontend for the Chat App, providing a responsive and interactive user interface for messaging and group chats. It features user authentication, real-time messaging, push notifications, file uploads, and a modern UI built with React and Tailwind CSS.

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration
- 💬 **Direct Messaging** - Private conversations between users
- 👥 **Group Chats** - Create and manage group conversations
- 🔔 **Push Notifications** - Real-time alerts for new messages
- 📤 **File Uploads** - Share files in chats
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Clean interface with Tailwind CSS

## 🏗️ Project Structure

```
frontend/
├── public/                # Public assets
├── src/
│   ├── components/        # UI components
│   │   ├── auth/          # Authentication components
│   │   ├── chat/          # Chat-related components
│   │   ├── common/        # Shared components
│   │   └── ui/            # UI elements
│   ├── config/            # App configuration (e.g., firebase.js)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components (Home, Login, Register)
│   ├── services/          # API services
│   ├── App.jsx            # Main app component
│   ├── App.css            # Global styles
│   ├── index.css          # Tailwind imports
│   └── main.jsx           # App entry point
└── package.json           # Dependencies and scripts
```

## ⚙️ Key Technologies

- **React** - UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Firebase** - Push notifications
- **Framer Motion** - Animations
- **Emoji Mart** - Emoji picker
- **Radix UI** - Headless UI components

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Backend API running at http://localhost:8000

### Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Environment setup**

Create a `.env` file in the `frontend/` directory:

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

3. **Start the development server**

```bash
npm run dev
```

The frontend will run at: **http://localhost:5173**

## 🧩 Component Overview

### 🔐 Authentication

- **Login & Register Pages** - User authentication forms
- **ProtectedRoute** - Guards routes that require authentication
- **AuthRoute** - Redirects authenticated users away from login/register

### 💬 Chat Interface

- **Chat List** - Displays available conversations
- **Chat Window** - Shows messages in the current conversation
- **Message Input** - For composing and sending messages
- **User List** - Shows available users to start conversations with
- **PdfViewerModal** - View PDF files in chat

### 👥 Group Management

- **Group Creation** - Interface for creating new groups
- **Group Settings** - Manage group members and permissions
- **Group Chat** - Displays group messages

### 📤 File Uploads

- **Upload files** directly in chat (PDF, images, etc.)

## 🛠️ Available Scripts

- `npm run dev` - Run in development mode (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally
- `npm run start` - Alias for npm run dev

## 🎨 UI Components

The application uses a combination of custom components and Radix UI primitives styled with Tailwind CSS:

- **Avatar** - User and group avatars
- **Button** - Action buttons
- **ScrollArea** - Custom scrollable areas
- **Modal** - Dialog windows

## 📱 Responsive Design

The UI is fully responsive and works on all screen sizes:

- Mobile phones
- Tablets
- Desktops

## 🔄 State Management

Zustand is used for state management:

- **Auth Store** - User authentication state
- **Chat Store** - Active chats and messages
- **UI Store** - UI state (sidebar, modals, etc.)

## 📚 Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/en/main)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Contact:** For questions or issues, please open an issue or contact the maintainer.
