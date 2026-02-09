# AI Task Organizer 📝✨

An intelligent task management application powered by AI that automatically organizes and categorizes your tasks from natural language input. Built with React, Node.js, and Cohere AI.

## 🌟 Features

- **AI-Powered Task Parsing**: Enter multiple tasks in natural language, and let AI automatically extract, categorize, and prioritize them
- **Smart Categorization**: Tasks are automatically categorized (Work, Admin, Meetings, Personal, Other)
- **Priority Management**: Automatic priority assignment (High, Medium, Low)
- **User Authentication**: Secure JWT-based authentication system
- **Task Management**: Create, read, update, and delete tasks with ease
- **Advanced Filtering**: Filter tasks by status and category
- **Responsive UI**: Beautiful, modern interface built with Material-UI
- **Real-time Updates**: Instant task updates with toast notifications
- **Password Visibility Toggle**: Show/hide password with eye icon

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Cohere AI** - Natural language processing
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Cohere API Key** (Get it from [Cohere Dashboard](https://dashboard.cohere.com/))

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/SwamiMalavade/ai-task-organizer.git
cd ai-task-organizer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=task_organizer

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Cohere AI Configuration
COHERE_API_KEY=your_cohere_api_key_here
COHERE_MODEL=command-a-03-2025

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Database Setup

Make sure PostgreSQL is running, then:

```bash
cd backend

# Run database migrations
npm run build
npm run migrate

# (Optional) Seed with sample data
npm run seed
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
ai-task-organizer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # PostgreSQL connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Authentication logic
│   │   │   └── tasks.controller.ts  # Task CRUD operations
│   │   ├── database/
│   │   │   ├── migrate.ts           # Database migration script
│   │   │   ├── schema.sql           # PostgreSQL schema
│   │   │   └── seed.ts              # Seed data script
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Auth endpoints
│   │   │   └── tasks.routes.ts      # Task endpoints
│   │   ├── services/
│   │   │   └── ai.service.ts        # Cohere AI integration
│   │   └── server.ts                # Express server
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Authentication context
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Main dashboard
│   │   │   ├── Login.tsx            # Login page
│   │   │   └── Register.tsx         # Registration page
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   ├── theme.ts                 # MUI theme configuration
│   │   └── vite-env.d.ts            # Vite type definitions
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all user tasks (protected) |
| GET | `/api/tasks/categories` | Get all categories |
| POST | `/api/tasks/parse` | Parse natural language tasks with AI (protected) |
| PATCH | `/api/tasks/:id` | Update a task (protected) |
| DELETE | `/api/tasks/:id` | Delete a task (protected) |

## 🎨 Usage Example

### Creating Tasks with AI

Simply enter your tasks in natural language:

```
Finish quarterly report by Friday, high priority
Call client about project proposal
Review code for the new feature
Buy groceries
```

The AI will automatically:
- Extract individual tasks
- Assign categories (Work, Personal, etc.)
- Set priorities (High, Medium, Low)
- Add relevant notes

## 🚢 Deployment

### Render Deployment

**Backend (Web Service):**
1. Connect your GitHub repository
2. Set Root Directory: `backend`
3. Build Command: `npm install && npm run build && npm run migrate`
4. Start Command: `npm start`
5. Add environment variables in Render dashboard

**Frontend (Static Site):**
1. Connect your GitHub repository
2. Set Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add `VITE_API_URL` environment variable

### Environment Variables for Production

**Backend:**
```env
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_production_jwt_secret
COHERE_API_KEY=your_cohere_api_key
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-url.com
```

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Environment variable configuration
- CORS configuration
- SQL injection prevention with parameterized queries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Swami Malavade**

- GitHub: [@SwamiMalavade](https://github.com/SwamiMalavade)

## 🙏 Acknowledgments

- [Cohere AI](https://cohere.com/) for the powerful NLP capabilities
- [Material-UI](https://mui.com/) for the beautiful component library
- [Render](https://render.com/) for easy deployment

## 📧 Support

For support, email swamim@incubxperts.com or open an issue in the GitHub repository.

---

**Made with ❤️ and AI**
