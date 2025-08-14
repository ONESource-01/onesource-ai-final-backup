# ONESource-ai Production Dockerfile
FROM node:20-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile
COPY frontend/ ./
RUN npm run build

# Python backend
FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    redis-server \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy all application files
COPY . .

# CRITICAL: Ensure V2 prompt is included
COPY prompts/v2_system_prompt.txt /app/prompts/v2_system_prompt.txt

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 3000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8001/api/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]