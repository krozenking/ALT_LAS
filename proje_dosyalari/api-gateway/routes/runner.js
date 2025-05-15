const express = require('express');
const router = express.Router();

// Route to handle runner requests
router.post('/', async (req, res) => {
  try {
    // In a real implementation, this would call the runner service
    // For now, we'll just return a mock response
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: 'processing',
      altFile: req.body.altFile,
      lastFile: `result_${Date.now()}.last`,
      metadata: {
        timestamp: new Date().toISOString(),
        executionTime: 0
      }
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error in runner service:', error);
    res.status(500).json({ error: 'Runner service error' });
  }
});

// Route to get runner status
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock response
  res.json({
    id,
    status: 'completed',
    altFile: `task_${id}.alt`,
    lastFile: `result_${id}.last`,
    metadata: {
      timestamp: new Date().toISOString(),
      executionTime: 1.5
    }
  });
});

module.exports = router;
