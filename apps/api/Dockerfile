# Use bun as the base image
FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app

# Stage 1: Install dependencies and build
FROM base AS builder
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies for the monorepo
RUN bun install

# Copy the rest of the source
COPY apps/api/ ./apps/api/

# Generate prisma client
WORKDIR /app/apps/api
RUN bunx prisma generate

# Final image
FROM base AS runner
WORKDIR /app

# Copy built nodes/prisma and necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/src/generated ./apps/api/src/generated
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma.config.js ./apps/api/prisma.config.js
COPY --from=builder /app/apps/api/src ./apps/api/src
COPY --from=builder /app/packages ./packages
# Set environment variables
ENV NODE_ENV=production
EXPOSE 3002

WORKDIR /app/apps/api
CMD ["bun", "run", "src/app.ts"]
