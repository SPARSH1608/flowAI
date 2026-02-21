# Use bun as the base image
FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app

# Stage 1: Build dependencies
FROM base AS builder
COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN bun install

# Copy source
COPY apps/web/ ./apps/web/

# Set env for build (Next.js needs this for static optimization)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js app
WORKDIR /app/apps/web
RUN bun run build

# Stage 2: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Next.js standalone mode is usually preferred but requires more complex setup in monorepos.
# For simplicity and given the user request, we'll use a direct carry-over of the build.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

WORKDIR /app/apps/web
CMD ["bun", "run", "start"]
