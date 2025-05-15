"""
Tests for the Computer Vision Service.
"""

import os
import pytest
import asyncio
import numpy as np
import base64
from unittest.mock import patch, MagicMock
import cv2

# Import the service to test
from ai_orchestrator.src.services.computer_vision import ComputerVisionService

# Sample test image as base64 (1x1 pixel black image)
SAMPLE_IMAGE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

@pytest.fixture
def computer_vision_service():
    """Fixture to create a ComputerVisionService instance for testing."""
    service = ComputerVisionService()
    return service

@pytest.fixture
def sample_image():
    """Fixture to create a sample image for testing."""
    # Create a simple 100x100 black image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    # Add a white rectangle
    cv2.rectangle(img, (25, 25), (75, 75), (255, 255, 255), -1)
    return img

@pytest.mark.asyncio
async def test_initialize(computer_vision_service):
    """Test the initialization of the ComputerVisionService."""
    result = await computer_vision_service.initialize()
    assert result is True
    assert computer_vision_service.stats["total_requests"] == 0
    assert computer_vision_service.stats["successful_requests"] == 0
    assert computer_vision_service.stats["failed_requests"] == 0

@pytest.mark.asyncio
async def test_load_image_from_base64(computer_vision_service):
    """Test loading an image from base64 string."""
    image = await computer_vision_service._load_image(SAMPLE_IMAGE_BASE64)
    assert isinstance(image, np.ndarray)
    assert image.shape[2] == 3  # Should be a color image with 3 channels

@pytest.mark.asyncio
async def test_load_image_from_numpy(computer_vision_service, sample_image):
    """Test loading an image from numpy array."""
    image = await computer_vision_service._load_image(sample_image)
    assert isinstance(image, np.ndarray)
    assert image.shape == sample_image.shape
    assert np.array_equal(image, sample_image)

@pytest.mark.asyncio
async def test_process_image_resize(computer_vision_service, sample_image):
    """Test resizing an image."""
    result = await computer_vision_service.process_image(
        sample_image,
        operation="resize",
        parameters={"width": 50, "height": 50}
    )
    
    assert result["success"] is True
    assert "processed_image" in result
    assert result["width"] == 50
    assert result["height"] == 50
    assert "processing_time" in result
    
    # Verify the stats were updated
    assert computer_vision_service.stats["total_requests"] == 1
    assert computer_vision_service.stats["successful_requests"] == 1
    assert computer_vision_service.stats["image_processing_requests"] == 1

@pytest.mark.asyncio
async def test_process_image_crop(computer_vision_service, sample_image):
    """Test cropping an image."""
    result = await computer_vision_service.process_image(
        sample_image,
        operation="crop",
        parameters={"x": 25, "y": 25, "width": 50, "height": 50}
    )
    
    assert result["success"] is True
    assert "processed_image" in result
    assert result["x"] == 25
    assert result["y"] == 25
    assert result["width"] == 50
    assert result["height"] == 50
    assert "processing_time" in result

@pytest.mark.asyncio
async def test_process_image_grayscale(computer_vision_service, sample_image):
    """Test converting an image to grayscale."""
    result = await computer_vision_service.process_image(
        sample_image,
        operation="grayscale"
    )
    
    assert result["success"] is True
    assert "processed_image" in result
    assert "processing_time" in result

@pytest.mark.asyncio
async def test_process_image_invalid_operation(computer_vision_service, sample_image):
    """Test processing an image with an invalid operation."""
    result = await computer_vision_service.process_image(
        sample_image,
        operation="invalid_operation"
    )
    
    assert result["success"] is False
    assert "error" in result
    assert "processing_time" in result
    
    # Verify the stats were updated
    assert computer_vision_service.stats["total_requests"] == 1
    assert computer_vision_service.stats["successful_requests"] == 0
    assert computer_vision_service.stats["failed_requests"] == 1

@pytest.mark.asyncio
@patch('pytesseract.image_to_string')
async def test_perform_ocr(mock_image_to_string, computer_vision_service, sample_image):
    """Test performing OCR on an image."""
    # Mock the OCR function to return a fixed string
    mock_image_to_string.return_value = "Sample OCR Text"
    
    result = await computer_vision_service.perform_ocr(
        sample_image,
        parameters={"lang": "eng", "preprocess": True}
    )
    
    assert result["success"] is True
    assert result["text"] == "Sample OCR Text"
    assert result["lang"] == "eng"
    assert "processing_time" in result
    
    # Verify the stats were updated
    assert computer_vision_service.stats["total_requests"] == 1
    assert computer_vision_service.stats["successful_requests"] == 1
    assert computer_vision_service.stats["ocr_requests"] == 1

@pytest.mark.asyncio
@patch('cv2.dnn.readNetFromDarknet')
@patch('cv2.dnn.blobFromImage')
async def test_detect_objects(mock_blob_from_image, mock_read_net, computer_vision_service, sample_image):
    """Test detecting objects in an image."""
    # Mock the YOLO model
    mock_model = MagicMock()
    mock_read_net.return_value = mock_model
    
    # Mock the output layers
    mock_model.getLayerNames.return_value = ['layer1', 'layer2', 'layer3']
    mock_model.getUnconnectedOutLayers.return_value = [1, 2]
    
    # Mock the forward pass to return sample detections
    mock_output = np.array([
        [
            [0.5, 0.5, 0.2, 0.2, 0.9, 0.8, 0.1, 0.1]  # x, y, w, h, confidence, class1_score, class2_score, class3_score
        ]
    ])
    mock_model.forward.return_value = [mock_output]
    
    # Mock the NMS function
    with patch('cv2.dnn.NMSBoxes', return_value=[0]):
        # Add coco_classes to models
        computer_vision_service.models = {
            "yolo": mock_model,
            "coco_classes": ["person", "bicycle", "car"]
        }
        
        result = await computer_vision_service.detect_objects(
            sample_image,
            parameters={"model": "yolo", "confidence_threshold": 0.5, "draw_boxes": True}
        )
        
        assert result["success"] is True
        assert "objects" in result
        assert len(result["objects"]) == 1
        assert result["objects"][0]["class"] == "person"
        assert result["objects"][0]["confidence"] >= 0.5
        assert "annotated_image" in result
        assert "processing_time" in result
        
        # Verify the stats were updated
        assert computer_vision_service.stats["total_requests"] == 1
        assert computer_vision_service.stats["successful_requests"] == 1
        assert computer_vision_service.stats["object_detection_requests"] == 1

@pytest.mark.asyncio
async def test_get_stats(computer_vision_service):
    """Test getting service statistics."""
    # Add some sample stats
    computer_vision_service.stats["total_requests"] = 10
    computer_vision_service.stats["successful_requests"] = 8
    computer_vision_service.stats["failed_requests"] = 2
    computer_vision_service.stats["processing_times"] = [0.1, 0.2, 0.3]
    
    stats = computer_vision_service.get_stats()
    
    assert stats["total_requests"] == 10
    assert stats["successful_requests"] == 8
    assert stats["failed_requests"] == 2
    assert stats["average_processing_time"] == 0.2
    assert "processing_times" not in stats  # Should be removed to reduce size

@pytest.mark.asyncio
async def test_cache_functionality(computer_vision_service, sample_image):
    """Test the caching functionality."""
    # Process image twice with the same parameters
    result1 = await computer_vision_service.process_image(
        sample_image,
        operation="resize",
        parameters={"width": 50, "height": 50}
    )
    
    # Second call should use cache
    result2 = await computer_vision_service.process_image(
        sample_image,
        operation="resize",
        parameters={"width": 50, "height": 50}
    )
    
    assert result1["success"] is True
    assert result2["success"] is True
    assert result1["processed_image"] == result2["processed_image"]
    
    # Verify the stats were updated correctly (only one successful request despite two calls)
    assert computer_vision_service.stats["total_requests"] == 2
    assert computer_vision_service.stats["successful_requests"] == 1
    assert computer_vision_service.stats["image_processing_requests"] == 2
