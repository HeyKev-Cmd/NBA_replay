# Dockerfile for the GameEventIngestService
#
# This file defines the steps to package the Spring Boot application into a Docker image.
# It uses a multi-stage build to create a small, efficient, and secure final image.

# --- Build Stage ---
# In this first stage, we use a Maven image to build the application JAR file from source.
# This stage has all the tools we need (Maven, JDK) but will be discarded later.
FROM maven:3.8.5-openjdk-17 AS builder

# Set the working directory inside the container.
WORKDIR /build

# Copy the Project Object Model (pom.xml) file first.
# This is a clever trick! Docker caches layers, so if the pom.xml hasn't changed,
# it will reuse the downloaded dependencies from the cache instead of downloading them again.
COPY pom.xml .
RUN mvn dependency:go-offline

# Now, copy the rest of the application's source code.
COPY src ./src

# Build the application! This creates the executable JAR file.
# We skip the tests because we only want to build the package.
RUN mvn package -DskipTests

# --- Production Stage ---
# Now we build the final image that will be used in production.
# We use a minimal Java Runtime Environment (JRE) image because it's smaller and more secure
# than a full JDK image. We don't need all the development tools to just run the app.
FROM eclipse-temurin:17-jre-jammy

# Set the working directory for our application.
WORKDIR /app

# Copy the JAR file that we built in the previous stage into our new, clean image.
# We also rename it to app.jar for a simpler, consistent name.
COPY --from=builder /build/target/GameEventIngestService-0.0.1-SNAPSHOT.jar app.jar

# Create a directory for the logs inside the final image.
# The application will write its log files here when it runs.
# We use 'mkdir' because the 'logs' directory doesn't exist in the source code.
RUN mkdir -p /app/src/logs
COPY --from=builder /build/src/logs /app/src/logs

ENTRYPOINT ["java", "-jar", "app.jar"]


