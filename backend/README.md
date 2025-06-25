# 🚀 Chat App - Backend

<div align="center">
  <p><em>Node.js backend with Express, Prisma, and MongoDB, following a clean Controller-Service-Repository architecture</em></p>
</div>

## 📋 Overview

This is the backend for the Chat App, providing a RESTful API for the frontend. It handles authentication, user management, direct and group messaging, file uploads, and real-time notifications via Firebase.

## 🏗️ Architecture

**Controller → Service → Repository → Database**

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data access operations

## 📁 Directory Structure

```
backend/
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database model definitions
├── src/
│   ├── config/            # App configuration
│   ├── constants/         # Application constants
│   ├── controllers/       # Request handlers
│   ├── errors/            # Error handling
│   ├── middlewares/       # Express middlewares
│   ├── repositories/      # Data access layer
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic layer
│   ├── validations/       # Request validation schemas
│   ├── app.js             # Express app setup
│   └── index.js           # Application entry point
└── package.json           # Dependencies and scripts
```

## ⚙️ Key Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - ORM for MongoDB
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Firebase Admin** - Push notifications
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB database
- Firebase project for push notifications

### Setup Instructions

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment setup**
   Create a `.env` file in the `backend/` directory:

   ```env
   DATABASE_URL="your_mongodb_connection_string"
   JWT_SECRET="your_secure_jwt_secret"
   PORT=8000
   CORS_ORIGIN="http://localhost:5173"
   ORIGIN_URL="http://localhost:5173"
   ```

3. **Set up Firebase Admin**
   Place your Firebase Admin key (JSON file) in the backend directory and reference it in your code/config.

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

   The backend will run at: **http://localhost:8000**

## 🌐 API Endpoints

### 🔐 Authentication

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

### 📤 File Uploads

- **POST** `/api/v1/upload` - Upload files (see frontend for usage)

## 🗄️ Database Schema

Key models:

- **User** - User accounts
- **Message** - Direct and group messages
- **Group** - Group chat info
- **GroupMembership** - User memberships in groups

## 🛠️ Available Scripts

- `npm run dev` - Run in development mode
- `npm run start` - Run in production mode
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma client
- `npm run lint` - Run linting
- `npm run format` - Format code with Prettier

## 📚 Resources

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [JSON Web Tokens](https://jwt.io/)

---

**Contact:** For questions or issues, please open an issue or contact the maintainer.
