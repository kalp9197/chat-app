# 🚀 Chat App - Backend

<div align="center">
  <img src="https://via.placeholder.com/150x150?text=Backend" alt="Backend Logo" width="150" height="150" />
  <p><em>Node.js backend with Express, Prisma, and MongoDB following the Controller-Service-Repository pattern</em></p>
</div>

## 📋 Overview

This is the backend for the Chat App, providing a RESTful API for the frontend. It handles authentication, user management, direct messaging, and group conversations with real-time notifications via Firebase.

## 🏗️ Architecture

### Controller-Service-Repository Pattern

The backend follows the Controller-Service-Repository pattern for better separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data access operations

```
request → Controller → Service → Repository → Database
response ← Controller ← Service ← Repository ← Database
```

### Directory Structure

```
backend/
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database model definitions
├── src/
│   ├── config/            # App configuration
│   │   ├── database.config.js  # Prisma client setup
│   │   ├── firebase.config.js  # Firebase setup for push notifications
│   │   └── server.config.js    # Express server configuration
│   ├── constants/         # Application constants
│   │   ├── env.js         # Environment variables
│   │   └── statusCodes.js # HTTP status codes
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.js     # Authentication endpoints
│   │   ├── directMessage.controller.js  # Direct messaging endpoints
│   │   ├── group.controller.js    # Group chat endpoints
│   │   ├── notification.controller.js   # Notification endpoints
│   │   └── user.controller.js     # User management endpoints
│   ├── middlewares/       # Express middlewares
│   │   ├── auth.middleware.js     # JWT authentication
│   │   └── validation.middleware.js  # Request validation
│   ├── repositories/      # Data access layer
│   │   ├── auth.repository.js     # Authentication queries
│   │   ├── directMessage.repository.js  # Direct message queries
│   │   ├── group.repository.js    # Group chat queries
│   │   ├── notification.repository.js   # Notification queries
│   │   └── user.repository.js     # User data queries
│   ├── routes/            # API route definitions
│   │   ├── auth.route.js      # Authentication routes
│   │   ├── directMessage.routes.js  # Messaging routes
│   │   ├── group.routes.js    # Group chat routes
│   │   ├── notification.routes.js   # Notification routes
│   │   └── user.routes.js     # User routes
│   ├── services/          # Business logic layer
│   │   ├── auth.service.js    # Authentication logic
│   │   ├── directMessage.service.js  # Messaging logic
│   │   ├── group.service.js   # Group management logic
│   │   ├── notification.service.js   # Notification logic
│   │   └── user.service.js    # User management logic
│   ├── validations/       # Request validation schemas
│   ├── app.js             # Express app setup
│   └── index.js           # Application entry point
└── package.json           # Dependencies and scripts
```

## ⚙️ Key Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Prisma** - Modern ORM for database access
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Token for authentication
- **Firebase Admin** - Push notification service
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB database
- Firebase project for push notifications

### Setting Up the Backend

1. **Install dependencies**

```bash
npm install
```

2. **Environment setup**

Create a `.env` file in the backend directory:

```
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
ORIGIN_URL="http://localhost:5173"
```

3. **Set up Firebase Admin**

Place your Firebase Admin key (JSON file) in the backend directory.

4. **Database setup**

```bash
npm run migrate
```

5. **Start the server**

```bash
# Development mode
npm run dev

# Production mode
npm run start
```

## 🌐 API Endpoints

### 🔒 Authentication

- **POST** `/api/v1/auth/register` - Register a new user
- **POST** `/api/v1/auth/login` - Login and get token

### 👤 Users

- **GET** `/api/v1/users` - Get all users

### 💬 Direct Messages

- **POST** `/api/v1/direct-messages` - Send a direct message
- **GET** `/api/v1/direct-messages/:receiver_uuid` - Get chat history with a user

### 👥 Groups

- **POST** `/api/v1/groups` - Create a new group
- **GET** `/api/v1/groups` - Get user's groups
- **GET** `/api/v1/groups/:uuid` - Get group by UUID
- **PUT** `/api/v1/groups/:uuid` - Update group
- **DELETE** `/api/v1/groups/:uuid` - Delete group
- **POST** `/api/v1/groups/:uuid/members` - Add members to group

### 🔔 Notifications

- **POST** `/api/v1/notifications/token` - Save FCM token for notifications

## 📋 Database Schema

The application uses MongoDB with Prisma ORM. Key models include:

- **User** - User accounts with authentication details
- **Message** - Direct and group messages
- **Group** - Group chat information
- **GroupMembership** - User memberships in groups

## 🧪 Available Scripts

- `npm run dev` - Run in development mode with auto-restart
- `npm run start` - Run in production mode
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma client
- `npm run lint` - Run linting
- `npm run format` - Format code with Prettier

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [JSON Web Tokens](https://jwt.io/)
