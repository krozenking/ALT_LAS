package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
	"github.com/krozenking/ALT_LAS/archive-service/internal/handlers"
	"github.com/krozenking/ALT_LAS/archive-service/internal/service"
	"github.com/stretchr/testify/assert"
)

func TestHealthCheckHandler(t *testing.T) {
	// Create a request to pass to our handler
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(healthCheckHandler)

	// Call the handler directly and pass in our request and response recorder
	handler.ServeHTTP(rr, req)

	// Check the status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Check the response body
	expected := `{"status":"UP"}`
	assert.Equal(t, expected, rr.Body.String())
}

func TestIndexHandler(t *testing.T) {
	// Create a request to pass to our handler
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(indexHandler)

	// Call the handler directly and pass in our request and response recorder
	handler.ServeHTTP(rr, req)

	// Check the status code
	assert.Equal(t, http.StatusOK, rr.Code)

	// Check the response body
	expected := "ALT_LAS Archive Service"
	assert.Equal(t, expected, rr.Body.String())
}

func TestSuccessRateHandler(t *testing.T) {
	// Create a success rate service
	successRateService := service.NewSuccessRateService(nil, nil)
	
	// Create a handler
	handler := handlers.NewSuccessRateHandler(successRateService)
	
	// Create a router
	r := mux.NewRouter()
	r.HandleFunc("/success-rate/check", handler.CheckSuccessRateHandler).Methods("GET")
	
	// Create a request with a valid rate
	req, err := http.NewRequest("GET", "/success-rate/check?rate=0.85", nil)
	if err != nil {
		t.Fatal(err)
	}
	
	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()
	
	// Serve the request
	r.ServeHTTP(rr, req)
	
	// Check the status code
	assert.Equal(t, http.StatusOK, rr.Code)
	
	// Check that the response contains expected fields
	assert.Contains(t, rr.Body.String(), "rate")
	assert.Contains(t, rr.Body.String(), "meets_threshold")
	assert.Contains(t, rr.Body.String(), "threshold")
	assert.Contains(t, rr.Body.String(), "category")
	
	// Create a request with an invalid rate
	req, err = http.NewRequest("GET", "/success-rate/check", nil)
	if err != nil {
		t.Fatal(err)
	}
	
	// Reset the ResponseRecorder
	rr = httptest.NewRecorder()
	
	// Serve the request
	r.ServeHTTP(rr, req)
	
	// Check the status code (should be bad request)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}
