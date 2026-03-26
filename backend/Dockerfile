# Haivens API — Node + Express + Prisma (production)
# Build with context = this directory (backend/):
#   cd backend && docker build -t haivens-backend:latest .

FROM node:22-bookworm-slim

WORKDIR /app

# Prisma's query engine links against OpenSSL. Install it explicitly so runtime
# detection is deterministic in ECS/Fargate.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps (includes devDependencies so `prisma generate` can run)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

# App source (see .dockerignore)
COPY server.js ./
COPY src ./src/
COPY public ./public/

# Generate Prisma Client (requires prisma/schema.prisma + node_modules)
RUN npx prisma generate

ENV NODE_ENV=production
# ECS / Fargate should set PORT to match target group (often 3000)
ENV PORT=3000

# Drop devDependencies; keep runtime + generated client
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "server.js"]
