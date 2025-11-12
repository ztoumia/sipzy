# Backend base image - Build tools pre-installed
# Tag: ztoumia/backend:latest
# Base: eclipse-temurin:21-jdk-jammy

FROM eclipse-temurin:21-jdk-jammy

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        unzip && \
    rm -rf /var/lib/apt/lists/*

ENV GRADLE_USER_HOME=/gradle-cache
RUN mkdir -p /gradle-cache

WORKDIR /build
