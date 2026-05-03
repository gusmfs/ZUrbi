# Dockerfile — builder JDK + imagem final JRE
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY zurbi-backend/pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY zurbi-backend/src ./src
RUN mvn -q -e -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
