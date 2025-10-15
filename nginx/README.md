# Nginx Load Balancer Setup

This setup includes an nginx load balancer that sits in front of your backend and frontend services, ensuring proper IP forwarding for geolocation functionality.

## Architecture

```
Internet → nginx:80 → /api/* → backend:3000
                  → /*     → frontend:80
```

## Getting Started

1. **Copy environment variables:**

   ```bash
   cp example.env .env
   # Edit .env with your actual values
   ```

2. **Start the services:**

   ```bash
   docker-compose up -d
   ```

3. **Access your application:**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Direct database access: mongodb://localhost:27017
   - Direct Redis access: localhost:6379

## IP Forwarding Configuration

The nginx configuration includes proper IP forwarding headers:

- `X-Real-IP`: Original client IP
- `X-Forwarded-For`: Chain of proxy IPs
- `X-Forwarded-Proto`: Original protocol (http/https)

The backend is configured with `trustProxy: true` to properly read these headers, ensuring your country-stats functionality gets accurate IP geolocation.

## Load Balancing

Currently configured for a single backend instance. To add more backend instances:

1. Update docker-compose.yaml to add more backend services
2. Update nginx/nginx.conf upstream block to include additional servers

## Security Headers

Nginx adds security headers:

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
