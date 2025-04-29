package listener

import (
	"fmt"
	"log"
	"time"
)

// LastFileProcessor handles the processing of *.last files
type LastFileProcessor struct {
	// This would typically include a repository or service for storing data
	successRateThreshold float64
}

// NewLastFileProcessor creates a new LastFileProcessor
func NewLastFileProcessor(successRateThreshold float64) *LastFileProcessor {
	return &LastFileProcessor{
		successRateThreshold: successRateThreshold,
	}
}

// ProcessLastFile processes a *.last file message
func (p *LastFileProcessor) ProcessLastFile(msg *LastFileMessage) error {
	log.Printf("Processing *.last file: %s", msg.FilePath)

	// Check if the success rate meets the threshold
	if msg.SuccessRate < p.successRateThreshold {
		log.Printf("*.last file %s has a low success rate: %.2f (threshold: %.2f)",
			msg.FilePath, msg.SuccessRate, p.successRateThreshold)
		// In a real implementation, we might flag this for review or handle differently
	}

	// In a real implementation, this would:
	// 1. Read the *.last file from the file system
	// 2. Validate its contents
	// 3. Convert it to *.atlas format
	// 4. Store it in the database
	// 5. Index it for searching

	// For now, we'll just log that we processed it
	log.Printf("Successfully processed *.last file: %s (Success Rate: %.2f, Timestamp: %s)",
		msg.FilePath, msg.SuccessRate, msg.Timestamp.Format(time.RFC3339))

	return nil
}

// CreateLastFileHandler returns a LastFileHandler function that uses this processor
func (p *LastFileProcessor) CreateLastFileHandler() LastFileHandler {
	return func(msg *LastFileMessage) error {
		return p.ProcessLastFile(msg)
	}
}
