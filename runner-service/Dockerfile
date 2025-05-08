# Builder stage: Compiles the Rust application
FROM rust:1.75-slim as builder

WORKDIR /usr/src/runner-service

# Copy Cargo.toml and Cargo.lock to cache dependencies
COPY Cargo.toml Cargo.lock ./
# Create a dummy main.rs to build dependencies only if Cargo files changed
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --locked

# Copy the rest of the application source code
COPY src ./src

# Build the application again, this time with the actual source code
# This will be faster as dependencies are already built
RUN touch src/main.rs && cargo build --release --locked

# Runner stage: Creates a minimal image with the compiled binary
FROM debian:bullseye-slim

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/runner-service/target/release/runner-service .

# Ensure the binary is executable
RUN chmod +x ./runner-service

# Set environment variables (if any are always needed)
# ENV RUST_LOG=info

EXPOSE 8080

# Run the application
CMD ["./runner-service"]

