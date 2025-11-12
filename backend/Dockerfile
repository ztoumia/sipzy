# Multi-stage build for Spring Boot backend
# Base image: eclipse-temurin:21-jdk-jammy (verified on Docker Hub)

# Build stage
FROM eclipse-temurin:21-jdk-jammy AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Cache dependencies
COPY gradlew gradle/ build.gradle settings.gradle ./
COPY gradle gradle/
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# Build application
COPY src src/
RUN ./gradlew clean build -x test --no-daemon
RUN ./gradlew jacocoTestReport --no-daemon || true

# Runtime stage
FROM eclipse-temurin:21-jre-jammy

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r -g 1001 sipzy && \
    useradd -r -u 1001 -g sipzy -d /app -s /sbin/nologin sipzy

WORKDIR /app

COPY --from=builder --chown=sipzy:sipzy /build/build/libs/*.jar app.jar

ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
ENV SPRING_PROFILES_ACTIVE=prod

USER sipzy
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD java ${JAVA_OPTS} -jar app.jar
