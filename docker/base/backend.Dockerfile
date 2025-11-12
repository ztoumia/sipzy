# Base image for Sipzy Backend builds
# Build once, reuse for all backend builds
# Includes: Java 21 JDK, Gradle, build tools

FROM eclipse-temurin:21-jdk-jammy

# Install build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        unzip && \
    rm -rf /var/lib/apt/lists/*

# Pre-install Gradle wrapper dependencies
RUN mkdir -p /gradle-cache
ENV GRADLE_USER_HOME=/gradle-cache

WORKDIR /build
