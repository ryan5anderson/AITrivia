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

# Build args for React environment variables
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

# Build with environment variables
RUN npm run build


##########
# Stage 2: Backend runtime (serves API and static frontend)
##########
FROM node:20-alpine AS backend

# System CA bundle (keep for general TLS)
RUN apk add --no-cache ca-certificates && update-ca-certificates

WORKDIR /app/backend

# Project-specific Supabase CA (place this file in your repo at backend/certs/supabase-ca.crt)
# This fixes SELF_SIGNED_CERT_IN_CHAIN by pinning your project's CA.
COPY backend/certs/supabase-ca.crt /app/certs/supabase-ca.crt
ENV NODE_EXTRA_CA_CERTS=/app/certs/supabase-ca.crt

ENV NODE_ENV=production

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

# Start backend
CMD ["npm", "start"]
