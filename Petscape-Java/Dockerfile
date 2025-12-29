# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom first for dependency caching (layer cache hit on subsequent builds)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build (skip tests — tests run in CI, not in Docker build)
COPY src ./src
RUN mvn package -DskipTests -q

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runner

# Non-root user for security
RUN addgroup -S petscape && adduser -S petscape -G petscape
USER petscape

WORKDIR /app

# Upload directory (volume-mounted in docker-compose)
RUN mkdir -p uploads

# Copy only the fat jar from the build stage
COPY --from=builder /build/target/petscape-api-*.jar app.jar

EXPOSE 8080

# Use SPRING_PROFILES_ACTIVE=docker to activate application-docker.properties
ENTRYPOINT ["java", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-docker}", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
