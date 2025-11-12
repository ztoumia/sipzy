# Frontend Dockerfile with proper shared library handling
# Base image: ztoumia/frontend:latest (Node 20 + build tools)

FROM ztoumia/frontend:latest AS deps

WORKDIR /workspace

# Copy and install shared library dependencies
COPY --from=shared package*.json ./shared/
RUN cd shared && npm ci --only=production && npm cache clean --force

# Copy frontend package files
COPY package.json package-lock.json* ./frontend/
RUN cd frontend && npm ci && npm cache clean --force

# Builder stage
FROM ztoumia/frontend:latest AS builder

WORKDIR /workspace

# Copy shared library source + node_modules
COPY --from=shared . ./shared/
COPY --from=deps /workspace/shared/node_modules ./shared/node_modules

# Copy frontend source + node_modules
COPY . ./frontend/
COPY --from=deps /workspace/frontend/node_modules ./frontend/node_modules

# Build from frontend directory
WORKDIR /workspace/frontend

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
ENV PORT=3000

# Copy built files from builder
COPY --from=builder --chown=nextjs:nodejs /workspace/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /workspace/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/frontend/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
