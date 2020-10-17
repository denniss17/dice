FROM node:12 as frontendBuilder
COPY . /app
RUN cd /app/ui && npm install && npm run build

FROM adoptopenjdk/openjdk11 as backendBuilder
COPY . /app
COPY --from=frontendBuilder /app/ui/build/ /app/src/main/resources/static
RUN cd /app && ./gradlew build

FROM adoptopenjdk/openjdk11 as runner
COPY --from=backendBuilder /app/build/libs/ /app

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/dice-0.0.1.jar"]

