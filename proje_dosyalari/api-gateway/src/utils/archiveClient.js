const axios = require("axios");
const logger = require("./logger");

// TODO: Move service URLs to config
const ARCHIVE_SERVICE_URL = process.env.ARCHIVE_SERVICE_URL || "http://localhost:3003"; // Example URL

// Helper function to interact with Archive Service
const callArchiveService = async (method, endpoint, data = {}, headers = {}) => {
    const url = `${ARCHIVE_SERVICE_URL}${endpoint}`;
    logger.info(`Calling Archive Service: ${method.toUpperCase()} ${url}`, { data: (method.toLowerCase() === "get" || method.toLowerCase() === "delete") ? undefined : data }); // Avoid logging large payloads for GET/DELETE
    try {
        const config = { method, url, headers };
        if (method.toLowerCase() === "get" || method.toLowerCase() === "delete") {
            config.params = data.params; // Use params for GET/DELETE
        } else {
            config.data = data; // Use data for POST/PUT
        }
        // Use the default export axios(config)
        const response = await axios(config);
        logger.info(`Archive Service responded for ${method.toUpperCase()} ${endpoint}`, { status: response.status });
        return response.data;
    } catch (error) {
        logger.error(`Error in callArchiveService calling ${method.toUpperCase()} ${endpoint}:`, {
            errorMessage: error.message,
            // errorStack: error.stack, // Keep stack trace logging in the route handler's catch block
            axiosResponseStatus: error.response?.status,
            axiosResponseData: error.response?.data,
            hasResponseProperty: error.hasOwnProperty("response")
        });
        throw error; // Re-throw to be handled by the caller
    }
};

module.exports = { callArchiveService };

