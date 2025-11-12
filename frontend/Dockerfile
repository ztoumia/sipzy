# Frontend Dockerfile using pre-built base image
# Base image: ztoumia/frontend:latest (Node 20 + build tools)

FROM ztoumia/frontend:latest AS deps

WORKDIR /app

COPY --from=shared package*.json ./shared/
RUN cd shared && npm ci --only=production && npm cache clean --force

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Builder
FROM ztoumia/frontend:latest AS builder

WORKDIR /app

COPY --from=shared . ./shared/
COPY --from=deps /app/shared/node_modules ./shared/node_modules

COPY . .
COPY --from=deps /app/node_modules ./node_modules

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Runner
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

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
