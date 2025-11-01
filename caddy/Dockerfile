# Build frontend (Vite) and serve with Caddy

# 1) Frontend build stage
FROM node:20-alpine AS frontend
WORKDIR /app
# Copy only what's needed to build the frontend from the repo root
COPY package.json ./
COPY tsconfig.json ./
COPY index.html ./
COPY public ./public
COPY src ./src
# Install deps and build
RUN npm ci || npm install
RUN npm run build

# 2) Caddy runtime
FROM caddy:2.8-alpine
# Caddyfile config
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Static site files
COPY --from=frontend /app/dist /srv
# Caddy will serve according to /etc/caddy/Caddyfile
