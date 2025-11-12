# Base image for Sipzy Frontend/Backoffice builds
# Build once, reuse for all Node.js builds
# Includes: Node 20, build tools, common dependencies

FROM node:20-slim

# Install build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Configure npm for faster builds
RUN npm config set prefer-offline true && \
    npm config set audit false

WORKDIR /app
