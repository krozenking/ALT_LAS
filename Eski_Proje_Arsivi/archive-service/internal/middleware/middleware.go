package middleware

import (
	"net/http"
	"time"

	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
)

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(logger *logging.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Create a custom response writer to capture status code
			crw := &customResponseWriter{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
			}

			// Process the request
			next.ServeHTTP(crw, r)

			// Log the request
			duration := time.Since(start)
			logger.Info(
				"[HTTP] %s %s %d %s %s",
				r.Method,
				r.RequestURI,
				crw.statusCode,
				duration,
				r.UserAgent(),
			)
		})
	}
}

// RecoveryMiddleware recovers from panics
func RecoveryMiddleware(logger *logging.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					logger.Error("[PANIC] %v", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}

// customResponseWriter is a wrapper for http.ResponseWriter that captures the status code
type customResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

// WriteHeader captures the status code
func (crw *customResponseWriter) WriteHeader(code int) {
	crw.statusCode = code
	crw.ResponseWriter.WriteHeader(code)
}
