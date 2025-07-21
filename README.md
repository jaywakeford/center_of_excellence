# Enterprise Excellence Platform

A comprehensive platform that combines Center of Excellence (CoE), RAPID decision framework, and predictive analytics to drive enterprise innovation and operational excellence.

## 🚀 Features

### 1. Center of Excellence (CoE)
- **Innovation Management**: Submit, track, and manage employee-driven innovations
- **Collaborative Environment**: Comment, vote, and collaborate on ideas
- **Category Organization**: Organize innovations by departments and categories
- **Implementation Tracking**: Monitor progress from idea to execution

### 2. RAPID Decision Framework
- **R** - Recommend: Assign team members to provide input and analysis
- **A** - Agree: Identify stakeholders who must agree before proceeding
- **P** - Perform: Designate who will execute the work
- **I** - Input: Determine who provides specialized knowledge
- **D** - Decide: Assign the final decision maker
- **Workflow Automation**: Automated role assignments and progress tracking
- **Real-time Collaboration**: Live updates on decision progress

### 3. Predictive Analytics
- **Cost Savings Predictions**: ML-powered forecasting of potential savings
- **Success Probability**: Predict implementation success rates
- **Trend Analysis**: Identify patterns in innovation and decision-making
- **Real-time Dashboards**: Interactive visualizations of key metrics

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express** - Server framework
- **TypeScript** - Type safety and better developer experience
- **PostgreSQL** - Primary database
- **Prisma ORM** - Database abstraction and type safety
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time communication
- **Redis** - Caching and session management (optional)

### Frontend
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **Socket.io Client** - Real-time updates

## 📁 Project Structure

```
main/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm 8+
- PostgreSQL 13+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Center_CoE/main
```

2. **Set up the backend**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed the database (optional)
npx prisma db seed
```

3. **Set up the frontend**
```bash
cd frontend
npm install
```

### Running the Application

1. **Start the backend server**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

2. **Start the frontend development server**
```bash
cd frontend
npm start
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/excellence_platform"

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Socket.io
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Innovation Endpoints
- `GET /api/innovations` - List all innovations
- `POST /api/innovations` - Create new innovation
- `GET /api/innovations/:id` - Get innovation details
- `PUT /api/innovations/:id` - Update innovation
- `DELETE /api/innovations/:id` - Delete innovation
- `POST /api/innovations/:id/comments` - Add comment
- `POST /api/innovations/:id/vote` - Vote on innovation

### RAPID Decision Endpoints
- `GET /api/rapid/decisions` - List all decisions
- `POST /api/rapid/decisions` - Create new decision
- `GET /api/rapid/decisions/:id` - Get decision details
- `PUT /api/rapid/decisions/:id` - Update decision
- `POST /api/rapid/decisions/:id/roles` - Assign RAPID roles
- `POST /api/rapid/decisions/:id/approve` - Approve/reject decision

### Analytics Endpoints
- `GET /api/analytics/metrics` - Get performance metrics
- `GET /api/analytics/cost-savings` - Get cost savings data
- `GET /api/analytics/predictions` - Get ML predictions
- `POST /api/analytics/events` - Track analytics events

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend
npm test

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Using Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Deployment

1. Build the applications
```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

2. Set up production environment variables
3. Run database migrations
4. Start the applications with a process manager (PM2, systemd, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Project Documentation](./docs)
- [API Documentation](./docs/api)
- [Architecture Guide](./docs/architecture.md)
- [Deployment Guide](./docs/deployment-guide.md) 