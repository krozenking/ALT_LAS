package listener

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// LastFileMessage represents a message containing information about a new *.last file
type LastFileMessage struct {
	ID         string                 `json:"id"`
	FilePath   string                 `json:"file_path"`
	SuccessRate float64               `json:"success_rate"`
	Timestamp   time.Time             `json:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// LastFileHandler is a function type that handles LastFileMessage
type LastFileHandler func(msg *LastFileMessage) error

// NatsListener is responsible for listening to NATS messages about new *.last files
type NatsListener struct {
	conn      *nats.Conn
	subject   string
	queueGroup string
	handler   LastFileHandler
	isRunning bool
}

// NewNatsListener creates a new NATS listener
func NewNatsListener(natsURL, subject, queueGroup string, handler LastFileHandler) (*NatsListener, error) {
	conn, err := nats.Connect(natsURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS at %s: %w", natsURL, err)
	}

	return &NatsListener{
		conn:      conn,
		subject:   subject,
		queueGroup: queueGroup,
		handler:   handler,
		isRunning: false,
	}, nil
}

// Start begins listening for messages
func (nl *NatsListener) Start() error {
	if nl.isRunning {
		return fmt.Errorf("listener is already running")
	}

	// Subscribe to the subject with a queue group
	_, err := nl.conn.QueueSubscribe(nl.subject, nl.queueGroup, func(msg *nats.Msg) {
		var lastFileMsg LastFileMessage
		if err := json.Unmarshal(msg.Data, &lastFileMsg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			return
		}

		// Process the message with the handler
		if err := nl.handler(&lastFileMsg); err != nil {
			log.Printf("Error handling message: %v", err)
			return
		}
	})

	if err != nil {
		return fmt.Errorf("failed to subscribe to subject %s: %w", nl.subject, err)
	}

	nl.isRunning = true
	log.Printf("Started listening for *.last files on subject: %s, queue group: %s", nl.subject, nl.queueGroup)
	return nil
}

// Stop stops listening for messages and closes the connection
func (nl *NatsListener) Stop() error {
	if !nl.isRunning {
		return fmt.Errorf("listener is not running")
	}

	nl.conn.Close()
	nl.isRunning = false
	log.Printf("Stopped listening for *.last files")
	return nil
}

// IsRunning returns whether the listener is currently running
func (nl *NatsListener) IsRunning() bool {
	return nl.isRunning
}
