package models

import "time"

// Tag represents a tag associated with an Atlas entry.
type Tag struct {
    ID        string    `json:"id" db:"id"` // Assuming UUID or similar unique ID
    Name      string    `json:"name" db:"name"`
    Category  string    `json:"category,omitempty" db:"category"` // Added based on test error
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

