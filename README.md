# TaskTime 📋

**Your team's time, mastered.**

TaskTime is a modern task management application that brings clarity to your workday with smart scheduling, seamless tracking, and powerful team coordination. Built with React and Node.js, it offers an intuitive interface with real-time updates to keep your team aligned and productive.

## ✨ Features

- **Smart Task Management**: Create, organize, and track tasks with priority levels and status updates
- **Real-time Collaboration**: Live updates using Socket.io ensure your team stays synchronized
- **Intuitive Dashboard**: Visual statistics and deadline tracking at a glance
- **Flexible Views**: Switch between List and Kanban board views
- **Status Tracking**: Manage tasks through Pending, In Progress, and Completed states
- **Priority System**: Organize tasks by High, Medium, and Low priority levels
- **Deadline Management**: Never miss important dates with upcoming deadline alerts
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SunilBista/TaskManager.git
   cd tasktime
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the backend directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tasktime
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

   The backend API will be running on `http://localhost:3000`

## 🛠️ Tech Stack

### Frontend

- **React 19**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Socket.io Client**: Real-time communication
- **Shadcn**: Accessible component primitives
- **Lucide React**: Beautiful icons

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Socket.io**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

## 📁 Project Structure

```
tasktime/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── assets/         # Project assets
│   │   └── App.tsx        # Main application component
│   ├── public/            # Static assets
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   └── package.json
└── README.md
```

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm run test          # Run tests
npm run coverage      # Run tests with coverage
```

### Backend Testing

```bash
cd backend
npm run test          # Run tests with coverage
```

## 🚀 Building for Production

### Frontend

```bash
cd frontend
npm run build
npm run preview       # Preview production build
```

### Backend

```bash
cd backend
npm run build
npm start            # Start production server
```

## 📊 Dashboard Features

- **Task Statistics**: Visual overview of total, completed, in progress, and pending tasks
- **Priority Distribution**: See how tasks are distributed across priority levels
- **Upcoming Deadlines**: Never miss important due dates
- **Progress Tracking**: Monitor team productivity and task completion rates

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
