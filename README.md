# Country Statistics Dashboard

A real-time country statistics tracking application with a scalable backend and modern React frontend.

## 🚀 Quick Start (One Command Setup)

### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

### Setup & Run

#### Quick Start (One Command)

```bash
git clone <repository-url>
cd country-stats
cp example.env .env
npm run docker:up
```

#### Alternative Methods

**Method 1: Using NPM script (Recommended)**

```bash
npm run docker:up
```

**Method 2: Direct Docker Compose**

```bash
docker-compose up --build
```

**Method 3: Background mode**

```bash
npm run docker:up -- -d
```

That's it! 🎉 The application will be available at:

- **Frontend**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Redis**: `localhost:6379`

## 📋 What's Included

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│  Nginx Proxy    │────│  Load Balancer  │
│  (Frontend)     │    │   (Port 8000)   │    │  (5 Instances)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   NestJS API    │
                                               │   (Backend)     │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │     Redis       │
                                               │   (Database)    │
                                               └─────────────────┘
```

### Services

- **Frontend**: React + TypeScript + Vite + Material-UI
- **Backend**: NestJS + TypeScript (5 load-balanced instances)
- **Proxy**: Nginx for routing and load balancing
- **Database**: Redis for real-time statistics storage

## 🛠️ Development

### Running Tests

**Backend Tests:**

```bash
cd apps/backend
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Test coverage
```

**Frontend Tests:**

```bash
cd apps/frontend
npm test              # Unit tests
npm run test:coverage # Test coverage
```

### Development Mode

For development with hot reload:

**Backend:**

```bash
cd apps/backend
npm run dev
```

**Frontend:**

```bash
cd apps/frontend
npm run dev
```

### Linting

```bash
# Backend
cd apps/backend && npm run lint

# Frontend
cd apps/frontend && npm run lint
```

## 📊 Features

### Core Functionality

- ✅ **Real-time Country Statistics**: Track visitor counts by country
- ✅ **GeoIP Detection**: Automatic country detection from IP addresses
- ✅ **Live Data Updates**: Real-time statistics without page refresh
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Error Handling**: Comprehensive error states and retry mechanisms

### Technical Features

- ✅ **Load Balancing**: 5 backend instances with Nginx load balancer
- ✅ **Auto-scaling**: Docker Compose handles container orchestration
- ✅ **Health Checks**: Automatic service monitoring and restart
- ✅ **API Documentation**: Interactive Swagger/OpenAPI docs
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Testing**: Comprehensive unit and e2e test suites

## 🔧 Configuration

### Environment Variables

| Variable         | Description           | Default                 |
| ---------------- | --------------------- | ----------------------- |
| `REDIS_HOST`     | Redis server hostname | `redis`                 |
| `REDIS_PASSWORD` | Redis authentication  | `my-password`           |
| `REDIS_PORT`     | Redis server port     | `6379`                  |
| `FRONT_URL`      | Frontend URL for CORS | `http://127.0.0.1:8000` |
| `BACKEND_URL`    | Backend API URL       | `http://nginx:8000/api` |
| `TRUST_PROXY`    | Enable proxy trust    | `true`                  |
| `PORT`           | Backend server port   | `3000`                  |

### Customizing the Setup

**Change the application port:**

```yaml
# In docker-compose.yaml
nginx:
  ports:
    - "9000:8000" # Change 8000 to your preferred port
```

**Scale backend instances:**

```yaml
# Add more backend services or remove them
backend-6:
  build:
    context: .
    dockerfile: ./apps/backend/Dockerfile
  # ... same configuration as other backends
```

## 📚 API Documentation

Interactive API documentation is available at:
[http://localhost:8000/api/docs](http://localhost:8000/api/docs)

## 🧪 Testing

The application includes comprehensive test suites:

### Backend Tests (89 tests)

- Unit tests for services, controllers, and modules
- E2E tests for API endpoints
- Mocked external dependencies (Redis, GeoIP)

### Frontend Tests (64 tests)

- Component unit tests
- Hook tests
- Service layer tests with mocked HTTP requests
- Integration tests

**Run all tests:**

```bash
# Backend
cd apps/backend && npm test && npm run test:e2e

# Frontend
cd apps/frontend && npm test
```

## 📈 Performance

- **Load Balancing**: 5 backend instances for high availability
- **Redis Caching**: Fast in-memory statistics storage
- **Nginx Proxy**: Efficient request routing and static file serving
- **Docker Optimization**: Multi-stage builds for smaller images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Commit changes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎯 Quick Commands Reference

```bash
# Start everything (builds and starts all services)
npm run docker:up

# Start in background/detached mode
npm run docker:up -- -d

# Stop all services
npm run docker:down

# View real-time logs
npm run docker:logs

# Restart all services
npm run docker:restart

# Complete cleanup (removes containers, images, and volumes)
npm run docker:clean

# Development mode (without Docker)
npm run dev

# Build for production
npm run build
```
