# Multi-stage build for TypeScript Node backend

# Dependencies layer
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install

# Build layer
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production runtime
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
