"""
Unit tests for schema definitions.
"""

import unittest
from datetime import datetime

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from schemas.requests import (
    ModelParameters, LLMRequest, VisionRequest, VoiceRequest,
    BatchRequestItem, BatchProcessRequest, ModelVersionRequest
)
from schemas.responses import (
    BaseResponse, LLMResponse, VisionResponse, VoiceResponse,
    BatchResultItem, BatchProcessResponse, ModelInfo, StatusResponse
)


class TestRequestSchemas(unittest.TestCase):
    """Test cases for request schema models"""

    def test_model_parameters(self):
        """Test ModelParameters schema"""
        # Test with default values
        params = ModelParameters()
        self.assertEqual(params.temperature, 0.7)
        self.assertEqual(params.max_tokens, 1024)
        self.assertEqual(params.top_p, 0.9)
        self.assertEqual(params.top_k, 40)
        self.assertEqual(params.stop_sequences, None)
        self.assertEqual(params.repetition_penalty, 1.0)
        
        # Test with custom values
        params = ModelParameters(
            temperature=0.5,
            max_tokens=512,
            top_p=0.8,
            top_k=20,
            stop_sequences=["END"],
            repetition_penalty=1.2
        )
        self.assertEqual(params.temperature, 0.5)
        self.assertEqual(params.max_tokens, 512)
        self.assertEqual(params.top_p, 0.8)
        self.assertEqual(params.top_k, 20)
        self.assertEqual(params.stop_sequences, ["END"])
        self.assertEqual(params.repetition_penalty, 1.2)
        
    def test_llm_request(self):
        """Test LLMRequest schema"""
        # Test with required values only
        req = LLMRequest(input="Hello, world!")
        self.assertEqual(req.input, "Hello, world!")
        self.assertEqual(req.parameters, None)
        self.assertEqual(req.model_name, None)
        self.assertEqual(req.stream, False)
        
        # Test with all values
        params = ModelParameters(temperature=0.5)
        req = LLMRequest(
            input="Hello, world!",
            parameters=params,
            model_name="gpt-3.5-turbo",
            stream=True
        )
        self.assertEqual(req.input, "Hello, world!")
        self.assertEqual(req.parameters, params)
        self.assertEqual(req.model_name, "gpt-3.5-turbo")
        self.assertEqual(req.stream, True)
        
    def test_vision_request(self):
        """Test VisionRequest schema"""
        # Test with required values only
        req = VisionRequest(input="https://example.com/image.jpg")
        self.assertEqual(req.input, "https://example.com/image.jpg")
        self.assertEqual(req.parameters, None)
        self.assertEqual(req.model_name, None)
        self.assertEqual(req.detect_objects, False)
        self.assertEqual(req.ocr, False)
        
        # Test with all values
        params = ModelParameters(temperature=0.5)
        req = VisionRequest(
            input="https://example.com/image.jpg",
            parameters=params,
            model_name="clip-vit-base",
            detect_objects=True,
            ocr=True
        )
        self.assertEqual(req.input, "https://example.com/image.jpg")
        self.assertEqual(req.parameters, params)
        self.assertEqual(req.model_name, "clip-vit-base")
        self.assertEqual(req.detect_objects, True)
        self.assertEqual(req.ocr, True)
        
    def test_voice_request(self):
        """Test VoiceRequest schema"""
        # Test with required values only
        req = VoiceRequest(input="https://example.com/audio.mp3")
        self.assertEqual(req.input, "https://example.com/audio.mp3")
        self.assertEqual(req.parameters, None)
        self.assertEqual(req.model_name, None)
        self.assertEqual(req.language, "en")
        self.assertEqual(req.task, "transcribe")
        
        # Test with all values
        params = ModelParameters(temperature=0.5)
        req = VoiceRequest(
            input="https://example.com/audio.mp3",
            parameters=params,
            model_name="whisper-small",
            language="fr",
            task="translate"
        )
        self.assertEqual(req.input, "https://example.com/audio.mp3")
        self.assertEqual(req.parameters, params)
        self.assertEqual(req.model_name, "whisper-small")
        self.assertEqual(req.language, "fr")
        self.assertEqual(req.task, "translate")
        
    def test_batch_request(self):
        """Test BatchProcessRequest schema"""
        # Create batch items
        item1 = BatchRequestItem(
            type="llm",
            input="Hello, world!",
            model_name="gpt-3.5-turbo"
        )
        item2 = BatchRequestItem(
            type="vision",
            input="https://example.com/image.jpg",
            model_name="clip-vit-base"
        )
        
        # Test batch request
        req = BatchProcessRequest(requests=[item1, item2])
        self.assertEqual(len(req.requests), 2)
        self.assertEqual(req.requests[0], item1)
        self.assertEqual(req.requests[1], item2)
        self.assertEqual(req.parallel, True)
        
        # Test with parallel=False
        req = BatchProcessRequest(requests=[item1, item2], parallel=False)
        self.assertEqual(req.parallel, False)
        
    def test_model_version_request(self):
        """Test ModelVersionRequest schema"""
        req = ModelVersionRequest(model_type="llm", version="v2")
        self.assertEqual(req.model_type, "llm")
        self.assertEqual(req.version, "v2")


class TestResponseSchemas(unittest.TestCase):
    """Test cases for response schema models"""

    def test_base_response(self):
        """Test BaseResponse schema"""
        resp = BaseResponse(status="success")
        self.assertEqual(resp.status, "success")
        self.assertIsInstance(resp.timestamp, datetime)
        
    def test_llm_response(self):
        """Test LLMResponse schema"""
        # Test with required values only
        resp = LLMResponse(
            status="success",
            result="Generated text"
        )
        self.assertEqual(resp.status, "success")
        self.assertEqual(resp.result, "Generated text")
        self.assertEqual(resp.model_type, "llm")
        self.assertEqual(resp.model_name, None)
        self.assertEqual(resp.tokens_used, None)
        self.assertEqual(resp.processing_time, None)
        
        # Test with all values
        resp = LLMResponse(
            status="success",
            result="Generated text",
            model_type="llm",
            model_name="gpt-3.5-turbo",
            tokens_used=100,
            processing_time=0.5
        )
        self.assertEqual(resp.status, "success")
        self.assertEqual(resp.result, "Generated text")
        self.assertEqual(resp.model_type, "llm")
        self.assertEqual(resp.model_name, "gpt-3.5-turbo")
        self.assertEqual(resp.tokens_used, 100)
        self.assertEqual(resp.processing_time, 0.5)
        
    def test_vision_response(self):
        """Test VisionResponse schema"""
        # Test with string result
        resp = VisionResponse(
            status="success",
            result="Image description"
        )
        self.assertEqual(resp.status, "success")
        self.assertEqual(resp.result, "Image description")
        self.assertEqual(resp.model_type, "vision")
        
        # Test with dict result
        resp = VisionResponse(
            status="success",
            result={"description": "A cat", "confidence": 0.95}
        )
        self.assertEqual(resp.status, "success")
        self.assertEqual(resp.result["description"], "A cat")
        self.assertEqual(resp.result["confidence"], 0.95)
        
    def test_voice_response(self):
        """Test VoiceResponse schema"""
        resp = VoiceResponse(
            status="success",
            result="Transcribed text"
        )
        self.assertEqual(resp.status, "success")
        self.assertEqual(resp.result, "Transcribed text")
        self.assertEqual(resp.model_type, "voice")
        
    def test_batch_result_item(self):
        """Test BatchResultItem schema"""
        # Test with string result
        item = BatchResultItem(
            type="llm",
            result="Generated text",
            status="success"
        )
        self.assertEqual(item.type, "llm")
        self.assertEqual(item.result, "Generated text")
        self.assertEqual(item.status, "success")
        self.assertEqual(item.model_name, None)
        self.assertEqual(item.processing_time, None)
        
        # Test with dict result
        item = BatchResultItem(
            type="vision",
            result={"description": "A cat"},
            status="success",
            model_name="clip-vit-base",
            processing_time=0.5
        )
        self.assertEqual(item.type, "vision")
        self.assertEqual(item.result["description"], "A cat")
        self.assertEqual(item.status, "success")
        self.assertEqual(item.model_name, "clip-vit-base")
        self.assertEqual(item.processing_time, 0.5)
        
    def test_batch_process_response(self):
        """Test BatchProcessResponse schema"""
        # Create batch result items
        item1 = BatchResultItem(
            type="llm",
            result="Generated text",
            status="success"
        )
        item2 = BatchResultItem(
            type="vision",
            result={"description": "A cat"},
            status="success"
        )
        
        # Test batch response
        resp = BatchProcessResponse(
            status="success",
            results=[item1, item2]
        )
        self.assertEqual(resp.status, "success")
        self.assertEqual(len(resp.results), 2)
        self.assertEqual(resp.results[0], item1)
        self.assertEqual(resp.results[1], item2)
        self.assertEqual(resp.total_time, None)
        
        # Test with total_time
        resp = BatchProcessResponse(
            status="success",
            results=[item1, item2],
            total_time=1.0
        )
        self.assertEqual(resp.total_time, 1.0)
        
    def test_model_info(self):
        """Test ModelInfo schema"""
        # Test with required values only
        info = ModelInfo(
            name="gpt-3.5-turbo",
            type="llm",
            version="v1",
            loaded=True,
            local=False
        )
        self.assertEqual(info.name, "gpt-3.5-turbo")
        self.assertEqual(info.type, "llm")
        self.assertEqual(info.version, "v1")
        self.assertEqual(info.loaded, True)
        self.assertEqual(info.local, False)
        self.assertEqual(info.description, None)
        
        # Test with all values
        info = ModelInfo(
            name="gpt-3.5-turbo",
            type="llm",
            version="v1",
            description="OpenAI's GPT-3.5 Turbo model",
            parameters={"temperature": 0.7},
            capabilities=["text-generation", "chat"],
            loaded=True,
            local=False,
            quantized="int8",
            size_mb=1024.5
        )
        self.assertEqual(info.name, "gpt-3.5-turbo")
        self.assertEqual(info.description, "OpenAI's GPT-3.5 Turbo model")
        self.assertEqual(info.parameters["temperature"], 0.7)
        self.assertEqual(info.capabilities, ["text-generation", "chat"])
        self.assertEqual(info.quantized, "int8")
        self.assertEqual(info.size_mb, 1024.5)
        
    def test_status_response(self):
        """Test StatusResponse schema"""
        resp = StatusResponse(
            status={"model1": {"loaded": True}},
            uptime=3600,
            models_loaded=1,
            gpu_available=True
        )
        self.assertEqual(resp.status["model1"]["loaded"], True)
        self.assertEqual(resp.uptime, 3600)
        self.assertEqual(resp.models_loaded, 1)
        self.assertEqual(resp.gpu_available, True)


if __name__ == '__main__':
    unittest.main()
