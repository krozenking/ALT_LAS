"""
Unit tests for LLM model implementations.
"""

import os
import unittest
from unittest.mock import patch, MagicMock, AsyncMock

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from models.llm.base import BaseLLMModel
from models.llm.onnx_llm import ONNXLLMModel
from models.llm.llama_cpp import LlamaCppModel
from models.llm.ggml_model import GGMLModel


class TestBaseLLMModel(unittest.TestCase):
    """Test cases for base LLM model"""

    def test_init(self):
        """Test initialization"""
        # Create a concrete implementation for testing
        class ConcreteLLM(BaseLLMModel):
            async def load(self): pass
            async def unload(self): pass
            async def generate(self, prompt, **kwargs): pass
            async def get_stats(self): pass
            def get_metadata(self): pass
        
        model = ConcreteLLM("test-model", "/path/to/model", param1="value1")
        
        self.assertEqual(model.model_name, "test-model")
        self.assertEqual(model.model_path, "/path/to/model")
        self.assertEqual(model.model_config["param1"], "value1")
        self.assertFalse(model.is_loaded)
        self.assertEqual(model.metadata, {})
        
    def test_is_ready(self):
        """Test is_ready property"""
        # Create a concrete implementation for testing
        class ConcreteLLM(BaseLLMModel):
            async def load(self): pass
            async def unload(self): pass
            async def generate(self, prompt, **kwargs): pass
            async def get_stats(self): pass
            def get_metadata(self): pass
        
        model = ConcreteLLM("test-model")
        self.assertFalse(model.is_ready)
        
        model.is_loaded = True
        self.assertTrue(model.is_ready)


class TestONNXLLMModel(unittest.TestCase):
    """Test cases for ONNX LLM model"""

    def setUp(self):
        """Set up test environment"""
        self.model = ONNXLLMModel("test-model", "/path/to/model", device="cpu")
        
    def test_init(self):
        """Test initialization"""
        self.assertEqual(self.model.model_name, "test-model")
        self.assertEqual(self.model.model_path, "/path/to/model")
        self.assertEqual(self.model.device, "cpu")
        self.assertFalse(self.model.is_loaded)
        self.assertEqual(self.model.metadata["type"], "onnx")
        self.assertEqual(self.model.metadata["name"], "test-model")
        self.assertEqual(self.model.metadata["device"], "cpu")
        
    @patch('models.llm.onnx_llm.ort')
    @patch('models.llm.onnx_llm.AutoTokenizer')
    @patch('os.path.exists', return_value=True)
    async def test_load(self, mock_exists, mock_tokenizer, mock_ort):
        """Test loading model"""
        # Mock ONNX Runtime session
        mock_session = MagicMock()
        mock_session.get_inputs.return_value = [MagicMock(name="input1")]
        mock_session.get_outputs.return_value = [MagicMock(name="output1")]
        mock_session.get_providers.return_value = ["CPUExecutionProvider"]
        
        mock_ort.InferenceSession.return_value = mock_session
        mock_ort.SessionOptions.return_value = MagicMock()
        mock_ort.GraphOptimizationLevel.ORT_ENABLE_ALL = 99
        mock_ort.get_available_providers.return_value = ["CPUExecutionProvider"]
        
        # Mock tokenizer
        mock_tokenizer.from_pretrained.return_value = MagicMock()
        
        # Test load
        result = await self.model.load()
        
        self.assertTrue(result)
        self.assertTrue(self.model.is_loaded)
        self.assertIsNotNone(self.model.ort_session)
        self.assertIsNotNone(self.model.tokenizer)
        
        # Verify calls
        mock_ort.InferenceSession.assert_called_once()
        mock_tokenizer.from_pretrained.assert_called_once()
        
    @patch('models.llm.onnx_llm.gc')
    async def test_unload(self, mock_gc):
        """Test unloading model"""
        # Setup
        self.model.ort_session = MagicMock()
        self.model.tokenizer = MagicMock()
        self.model.is_loaded = True
        
        # Test unload
        result = await self.model.unload()
        
        self.assertTrue(result)
        self.assertFalse(self.model.is_loaded)
        self.assertIsNone(self.model.ort_session)
        self.assertIsNone(self.model.tokenizer)
        
        # Verify calls
        mock_gc.collect.assert_called_once()


class TestLlamaCppModel(unittest.TestCase):
    """Test cases for llama.cpp LLM model"""

    def setUp(self):
        """Set up test environment"""
        self.model = LlamaCppModel("test-model", "/path/to/model", n_gpu_layers=1)
        
    def test_init(self):
        """Test initialization"""
        self.assertEqual(self.model.model_name, "test-model")
        self.assertEqual(self.model.model_path, "/path/to/model")
        self.assertEqual(self.model.n_gpu_layers, 1)
        self.assertFalse(self.model.is_loaded)
        self.assertEqual(self.model.metadata["type"], "llama.cpp")
        self.assertEqual(self.model.metadata["name"], "test-model")
        self.assertEqual(self.model.metadata["n_gpu_layers"], 1)
        
    @patch('models.llm.llama_cpp.Llama')
    @patch('os.path.exists', return_value=True)
    @patch('os.path.isdir', return_value=False)
    @patch('os.path.getsize', return_value=1024*1024)
    async def test_load(self, mock_getsize, mock_isdir, mock_exists, mock_llama):
        """Test loading model"""
        # Mock llama.cpp
        mock_llm = MagicMock()
        mock_llm.n_vocab.return_value = 32000
        mock_llama.return_value = mock_llm
        
        # Test load
        result = await self.model.load()
        
        self.assertTrue(result)
        self.assertTrue(self.model.is_loaded)
        self.assertIsNotNone(self.model.llm)
        
        # Verify calls
        mock_llama.assert_called_once()
        
    @patch('models.llm.llama_cpp.gc')
    async def test_unload(self, mock_gc):
        """Test unloading model"""
        # Setup
        self.model.llm = MagicMock()
        self.model.is_loaded = True
        
        # Test unload
        result = await self.model.unload()
        
        self.assertTrue(result)
        self.assertFalse(self.model.is_loaded)
        self.assertIsNone(self.model.llm)
        
        # Verify calls
        mock_gc.collect.assert_called_once()


class TestGGMLModel(unittest.TestCase):
    """Test cases for GGML model"""

    def setUp(self):
        """Set up test environment"""
        self.model = GGMLModel("test-model", "/path/to/model", gpu_layers=1)
        
    def test_init(self):
        """Test initialization"""
        self.assertEqual(self.model.model_name, "test-model")
        self.assertEqual(self.model.model_path, "/path/to/model")
        self.assertEqual(self.model.gpu_layers, 1)
        self.assertFalse(self.model.is_loaded)
        self.assertEqual(self.model.metadata["type"], "ggml")
        self.assertEqual(self.model.metadata["name"], "test-model")
        self.assertEqual(self.model.metadata["gpu_layers"], 1)
        
    def test_determine_model_type(self):
        """Test model type determination"""
        self.assertEqual(self.model._determine_model_type("model_llama.bin"), "llama")
        self.assertEqual(self.model._determine_model_type("gpt-j-6b.bin"), "gpt-j")
        self.assertEqual(self.model._determine_model_type("gpt2-medium.bin"), "gpt2")
        self.assertEqual(self.model._determine_model_type("mpt-7b.bin"), "mpt")
        self.assertEqual(self.model._determine_model_type("falcon-7b.bin"), "falcon")
        self.assertEqual(self.model._determine_model_type("dolly-v2.bin"), "dolly")
        self.assertEqual(self.model._determine_model_type("replit-code.bin"), "replit")
        self.assertEqual(self.model._determine_model_type("starcoder.bin"), "starcoder")
        self.assertEqual(self.model._determine_model_type("unknown.bin"), "llama")  # Default
        
    @patch('models.llm.ggml_model.AutoModelForCausalLM')
    @patch('os.path.exists', return_value=True)
    @patch('os.path.isdir', return_value=False)
    @patch('os.path.getsize', return_value=1024*1024)
    async def test_load(self, mock_getsize, mock_isdir, mock_exists, mock_auto_model):
        """Test loading model"""
        # Mock AutoModelForCausalLM
        mock_model = MagicMock()
        mock_auto_model.from_pretrained.return_value = mock_model
        
        # Test load
        result = await self.model.load()
        
        self.assertTrue(result)
        self.assertTrue(self.model.is_loaded)
        self.assertIsNotNone(self.model.model)
        
        # Verify calls
        mock_auto_model.from_pretrained.assert_called_once()
        
    @patch('models.llm.ggml_model.gc')
    async def test_unload(self, mock_gc):
        """Test unloading model"""
        # Setup
        self.model.model = MagicMock()
        self.model.is_loaded = True
        
        # Test unload
        result = await self.model.unload()
        
        self.assertTrue(result)
        self.assertFalse(self.model.is_loaded)
        self.assertIsNone(self.model.model)
        
        # Verify calls
        mock_gc.collect.assert_called_once()


if __name__ == '__main__':
    unittest.main()
