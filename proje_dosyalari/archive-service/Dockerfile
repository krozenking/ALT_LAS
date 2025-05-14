# Builder stage
FROM golang:1.18-alpine AS builder
WORKDIR /app

# Copy go.mod and go.sum files to download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application
# CGO_ENABLED=0 for a static binary
# -ldflags "-w -s" to strip debug information and reduce binary size
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags "-w -s" -o /go/bin/archive-service .

# Final stage
FROM alpine:latest
WORKDIR /app

# Copy the static binary from the builder stage
COPY --from=builder /go/bin/archive-service .

# Copy any other necessary assets if needed (e.g., config files, templates)
# For now, assuming the binary is self-contained or config is via env vars

EXPOSE 9000

# Run the application
CMD ["./archive-service"]

