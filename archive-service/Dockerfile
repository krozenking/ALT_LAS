FROM golang:1.18-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o archive-service .

EXPOSE 9000

CMD ["./archive-service"]
