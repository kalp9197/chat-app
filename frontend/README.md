# 🚀 Chat App - Frontend

<div align="center">
  <p><em>Modern React frontend with Vite, Tailwind CSS, and real-time messaging capabilities</em></p>
</div>

## 📋 Overview

This is the frontend for the Chat App, providing a responsive and interactive user interface for messaging and group chats. It features user authentication, real-time messaging, push notifications, and a modern UI built with React and Tailwind CSS.

## ✨ Features

- 🔒 **User Authentication** - Secure login and registration
- 💬 **Direct Messaging** - Private conversations between users
- 👥 **Group Chats** - Create and manage group conversations
- 🔔 **Push Notifications** - Real-time alerts for new messages
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean interface with Tailwind CSS

## 🏗️ Project Structure

```
frontend/
├── public/                # Public assets
├── src/
│   ├── components/        # UI components
│   │   ├── auth/          # Authentication components
│   │   │   ├── AuthRoute.jsx      # Route for authenticated users
│   │   │   └── ProtectedRoute.jsx # Route for protected pages
│   │   ├── chat/          # Chat-related components
│   │   ├── common/        # Shared components
│   │   │   └── NotificationBanner.jsx # Notification permission banner
│   │   └── ui/            # UI elements
│   ├── config/            # Application configuration
│   │   └── firebase.js    # Firebase setup for notifications
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.js     # Authentication state management
│   │   └── useNotification.js # Notification handling
│   ├── lib/               # Utility functions
│   │   └── api.js         # API client
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Main chat interface
│   │   ├── Login.jsx      # User login
│   │   └── Register.jsx   # User registration
│   ├── services/          # API services
│   │   ├── auth.service.js  # Authentication API calls
│   │   ├── chat.service.js  # Messaging API calls
│   │   └── user.service.js  # User management API calls
│   ├── App.jsx            # Application component
│   ├── App.css            # Global styles
│   ├── index.css          # Tailwind imports
│   └── main.jsx           # Application entry point
└── package.json           # Dependencies and scripts
```

## ⚙️ Key Technologies

- **React** - UI library
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Firebase** - Push notifications
- **Framer Motion** - Animation library
- **Emoji Mart** - Emoji picker
- **Radix UI** - Headless UI components

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Backend API running

### Setting Up the Frontend

1. **Install dependencies**

```bash
npm install
```

2. **Environment setup**

Create a `.env` file in the frontend directory:

```
VITE_API_URL="http://localhost:5000/api/v1"
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

This will start the frontend application on `http://localhost:3000`.

## 📚 Component Overview

### 🔒 Authentication

- **Login & Register Pages** - User authentication forms
- **ProtectedRoute** - Guards routes that require authentication
- **AuthRoute** - Redirects authenticated users away from login/register

### 💬 Chat Interface

- **Chat List** - Displays available conversations
- **Chat Window** - Shows messages in the current conversation
- **Message Input** - For composing and sending messages
- **User List** - Shows available users to start conversations with

### 👥 Group Management

- **Group Creation** - Interface for creating new groups
- **Group Settings** - Manages group members and permissions
- **Group Chat** - Displays group messages

## 🧪 Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally
- `npm run start` - Alias for npm run dev

## 🎨 UI Components

The application uses a combination of custom components and Radix UI primitives styled with Tailwind CSS:

- **Avatar** - User and group avatars
- **Button** - Action buttons with various styles
- **ScrollArea** - Custom scrollable areas
- **Modal** - Dialog windows for forms and confirmations

## 📱 Responsive Design

The UI is fully responsive and works on various screen sizes:

- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🔍 State Management

Zustand is used for state management with the following stores:

- **Auth Store** - Manages user authentication state
- **Chat Store** - Handles active chats and messages
- **UI Store** - Controls UI state like sidebar visibility

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/en/main)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
