# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps

# Installer libs nécessaires pour compiler certains modules natifs
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy shared package files and install its dependencies
COPY --from=shared package*.json ./shared/
RUN cd shared && npm ci && npm cache clean --force

# Copy backoffice package files and install its dependencies
COPY package.json package-lock.json* ./backoffice/
RUN cd backoffice && npm ci && npm cache clean --force

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package from additional build context (injected via build-contexts in GitHub Actions)
COPY --from=shared . ./shared/

# Copy shared dependencies from deps stage
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy backoffice application files from main context
COPY . ./backoffice/

# Copy backoffice dependencies from deps stage
COPY --from=deps /app/backoffice/node_modules ./backoffice/node_modules

# Set working directory to backoffice for build
WORKDIR /app/backoffice

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application (tsconfig paths will resolve @sipzy/shared to ../shared)
RUN npm run build

# ========================================
# Stage 3: Runner (Production)
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/backoffice/public ./public
COPY --from=builder /app/backoffice/.next/standalone ./
COPY --from=builder /app/backoffice/.next/static ./.next/static

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
