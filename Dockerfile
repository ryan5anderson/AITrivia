##########
# Stage 1: Build React frontend
##########
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend deps
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend ./
RUN npm run build

##########
# Stage 2: Backend runtime (serves API and static frontend)
##########
FROM node:20-alpine AS backend

ENV NODE_ENV=production
WORKDIR /app/backend

# Install backend deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend sources
COPY backend ./

# Copy built frontend into backend public dir
COPY --from=frontend-builder /app/frontend/build ./public

# Fly will route to this port
ENV PORT=8080
EXPOSE 8080

# Start backend (monorepo script changes into app/ and runs server)
CMD ["npm", "start"]
