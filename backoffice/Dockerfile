# Backoffice Dockerfile with proper shared library handling
# Base image: ztoumia/frontend:latest (Node 20 + build tools)

FROM ztoumia/frontend:latest AS deps

WORKDIR /workspace

# Copy and install shared library dependencies
COPY --from=shared package*.json ./shared/
RUN cd shared && npm ci && npm cache clean --force

# Copy backoffice package files
COPY package.json package-lock.json* ./backoffice/
RUN cd backoffice && npm ci && npm cache clean --force

# Builder stage
FROM ztoumia/frontend:latest AS builder

WORKDIR /workspace

# Copy shared library source + node_modules
COPY --from=shared . ./shared/
COPY --from=deps /workspace/shared/node_modules ./shared/node_modules

# Copy backoffice source + node_modules
COPY . ./backoffice/
COPY --from=deps /workspace/backoffice/node_modules ./backoffice/node_modules

# Build from backoffice directory
WORKDIR /workspace/backoffice

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Now tsconfig paths work: @sipzy/shared → ../shared ✅
RUN npm run build

# Runner stage
FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs -d /app -s /sbin/nologin nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

# Copy built files from builder
COPY --from=builder --chown=nextjs:nodejs /workspace/backoffice/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/backoffice/.next/static ./.next/static

USER nextjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
