FROM rust:1.75-slim as builder

WORKDIR /usr/src/runner-service
COPY . .

RUN cargo build --release

FROM debian:bullseye-slim

WORKDIR /app

COPY --from=builder /usr/src/runner-service/target/release/runner-service /app/

EXPOSE 8080

CMD ["./runner-service"]
