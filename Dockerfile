# Stage 1: Build the Vite React Frontend and backend dependencies
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime Runner
FROM node:18-alpine AS runner

WORKDIR /app

ENV PORT=5000

# Copy package info and all installed node_modules from build stage
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Copy backend source code and assets
COPY src/server ./src/server
COPY public ./public

EXPOSE 5000

CMD ["npx", "tsx", "src/server/index.ts"]
