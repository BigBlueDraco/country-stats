FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm ci
COPY . .
RUN npx turbo run build --filter=frontend...

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/apps/frontend/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
