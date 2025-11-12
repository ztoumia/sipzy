# Frontend base image - Build tools pre-installed
# Tag: ztoumia/frontend:latest
# Base: node:20-slim

FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN npm config set prefer-offline true && \
    npm config set audit false

WORKDIR /app
