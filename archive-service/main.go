package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// ArchiveRequest represents the request to archive a LAST file
type ArchiveRequest struct {
	LastFile string                 `json:"last_file"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// ArchiveResponse represents the response from archiving a LAST file
type ArchiveResponse struct {
	ID         string                 `json:"id"`
	Status     string                 `json:"status"`
	LastFile   string                 `json:"last_file"`
	AtlasEntry string                 `json:"atlas_entry"`
	Metadata   map[string]interface{} `json:"metadata"`
}

// SearchResult represents a search result from the Atlas database
type SearchResult struct {
	Results []ArchiveResponse `json:"results"`
	Count   int               `json:"count"`
}

func main() {
	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/", indexHandler).Methods("GET")
	r.HandleFunc("/health", healthCheckHandler).Methods("GET")
	r.HandleFunc("/archive", archiveHandler).Methods("POST")
	r.HandleFunc("/archive/{id}", getArchiveStatusHandler).Methods("GET")
	r.HandleFunc("/search", searchAtlasHandler).Methods("GET")

	// Start server
	log.Println("Starting Archive Service on port 9000")
	log.Fatal(http.ListenAndServe(":9000", r))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ALT_LAS Archive Service"))
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "UP"}
	json.NewEncoder(w).Encode(response)
}

func archiveHandler(w http.ResponseWriter, r *http.Request) {
	var req ArchiveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate a unique ID for this archive task
	taskID := uuid.New().String()

	// In a real implementation, this would archive the LAST file to the Atlas database
	// For now, we'll just create a mock response

	// Create metadata
	metadata := map[string]interface{}{
		"timestamp":    time.Now().Format(time.RFC3339),
		"success_rate": 0.95,
	}

	// If additional metadata was provided, merge it
	if req.Metadata != nil {
		for k, v := range req.Metadata {
			metadata[k] = v
		}
	}

	// Create response
	response := ArchiveResponse{
		ID:         taskID,
		Status:     "archived",
		LastFile:   req.LastFile,
		AtlasEntry: "atlas_" + taskID + ".atlas",
		Metadata:   metadata,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getArchiveStatusHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskID := vars["id"]

	// In a real implementation, this would check the status of an archive task
	// For now, we'll just return a mock response

	// Create metadata
	metadata := map[string]interface{}{
		"timestamp":    time.Now().Format(time.RFC3339),
		"success_rate": 0.95,
	}

	// Create response
	response := ArchiveResponse{
		ID:         taskID,
		Status:     "archived",
		LastFile:   "result_" + taskID + ".last",
		AtlasEntry: "atlas_" + taskID + ".atlas",
		Metadata:   metadata,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func searchAtlasHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		http.Error(w, "Query parameter is required", http.StatusBadRequest)
		return
	}

	// In a real implementation, this would search the Atlas database
	// For now, we'll just return a mock response

	// Create mock result
	mockID := uuid.New().String()
	mockResult := ArchiveResponse{
		ID:         mockID,
		Status:     "archived",
		LastFile:   "result_" + mockID + ".last",
		AtlasEntry: "atlas_" + mockID + ".atlas",
		Metadata: map[string]interface{}{
			"timestamp":    time.Now().Format(time.RFC3339),
			"success_rate": 0.98,
			"query_match":  query,
		},
	}

	// Create response
	response := SearchResult{
		Results: []ArchiveResponse{mockResult},
		Count:   1,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
