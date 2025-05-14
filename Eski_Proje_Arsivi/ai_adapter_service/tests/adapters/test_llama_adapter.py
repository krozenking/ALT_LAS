import pytest
import os
from unittest.mock import AsyncMock, patch, MagicMock
from dotenv import load_dotenv

from src.adapters.llama_adapter import LlamaCppAdapter
# Mock Llama and LlamaGrammar for tests if model file is not present or for unit testing logic

load_dotenv() # Load .env for API keys if not set in environment

LLAMA_MODEL_PATH = os.getenv("LLAMA_MODEL_PATH")
# Skip tests requiring a model if path is not set or model doesn't exist
# In a real CI, a small dummy model might be used, or these tests would be integration tests.
skip_if_no_model = pytest.mark.skipif(
    not LLAMA_MODEL_PATH or not os.path.exists(LLAMA_MODEL_PATH),
    reason="LLAMA_MODEL_PATH not set or model file not found. Skipping live Llama model tests."
)

@pytest.fixture
def llama_adapter_no_init_load():
    # Adapter that doesn't load model on init, for testing load_model separately
    with patch.dict(os.environ, {"LLAMA_MODEL_PATH": "/fake/model.gguf"}): # Ensure path is set for init
        adapter = LlamaCppAdapter(model_path="/fake/model.gguf")
        adapter.client = None # Ensure client is None initially
    return adapter

@pytest.fixture
@skip_if_no_model
def loaded_llama_adapter():
    # This fixture will only run if a model path is valid
    adapter = LlamaCppAdapter(model_path=LLAMA_MODEL_PATH, n_gpu_layers=0) # Use CPU for tests
    # adapter.load_model() # Model will be loaded on first use by _ensure_model_loaded
    return adapter

@pytest.mark.asyncio
async def test_llama_adapter_init_no_model_path():
    with patch.dict(os.environ, {"LLAMA_MODEL_PATH": ""}):
        with pytest.raises(ValueError, match="Llama model path not provided or found"):
            LlamaCppAdapter()

@pytest.mark.asyncio
async def test_llama_adapter_load_model_success(llama_adapter_no_init_load):
    # Mock the Llama class from llama_cpp to simulate successful loading
    mock_llama_instance = MagicMock()
    with patch("src.adapters.llama_adapter.Llama", return_value=mock_llama_instance) as mock_llama_class:
        with patch.dict(os.environ, {"LLAMA_MODEL_PATH": "/fake/model.gguf"}):
            adapter = LlamaCppAdapter(model_path="/fake/model.gguf")
            await adapter._ensure_model_loaded() # This calls load_model internally via to_thread
            mock_llama_class.assert_called_once_with(model_path="/fake/model.gguf", n_ctx=2048, n_gpu_layers=0, seed=-1, verbose=False)
            assert adapter.client is mock_llama_instance

@pytest.mark.asyncio
async def test_llama_adapter_load_model_failure(llama_adapter_no_init_load):
    with patch("src.adapters.llama_adapter.Llama", side_effect=Exception("Failed to load")) as mock_llama_class:
        with patch.dict(os.environ, {"LLAMA_MODEL_PATH": "/fake/invalid_model.gguf"}):
            adapter = LlamaCppAdapter(model_path="/fake/invalid_model.gguf")
            with pytest.raises(RuntimeError, match="Failed to load Llama model: Failed to load"):
                await adapter._ensure_model_loaded()
            mock_llama_class.assert_called_once()

@skip_if_no_model
@pytest.mark.asyncio
async def test_llama_chat_completion(loaded_llama_adapter):
    messages = [
        {"role": "system", "content": "You are a test assistant for Llama.cpp."},
        {"role": "user", "content": "Hello Llama! Tell me a short fact."}
    ]
    response = await loaded_llama_adapter.chat(messages, max_tokens=20)
    
    assert "response" in response
    assert isinstance(response["response"], str)
    assert len(response["response"]) > 0
    assert response["role"] == "assistant"
    assert response["model_name"] == "local-llama-model"
    assert "usage" in response
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "completion_tokens" in response["usage"]

@skip_if_no_model
@pytest.mark.asyncio
async def test_llama_generate_completion(loaded_llama_adapter):
    prompt = "Generate a short test completion using Llama.cpp:"
    response = await loaded_llama_adapter.generate(prompt, max_tokens=15)
    
    assert "generated_text" in response
    assert isinstance(response["generated_text"], str)
    assert len(response["generated_text"]) > 0
    assert response["model_name"] == "local-llama-model"
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "completion_tokens" in response["usage"]

@skip_if_no_model
@pytest.mark.asyncio
async def test_llama_embedding_generation(loaded_llama_adapter):
    # This test depends on the specific model used and if it supports embeddings
    # and if LlamaCppAdapter.client.embed is available and works.
    # For now, we assume it might not be supported or mock it.
    if not hasattr(loaded_llama_adapter.client, "embed") or not callable(loaded_llama_adapter.client.embed):
        pytest.skip("Llama model or llama-cpp-python version does not support embeddings, or client not loaded.")

    texts = ["Test sentence 1 for Llama embedding.", "Another test sentence for Llama."]
    response = await loaded_llama_adapter.embed(texts)
    
    if "error" in response and "not supported" in response["error"]:
        assert True # Expected if model doesn't support it
    else:
        assert "embeddings" in response
        assert isinstance(response["embeddings"], list)
        assert len(response["embeddings"]) == len(texts)
        for emb in response["embeddings"]:
            assert isinstance(emb, list)
            assert len(emb) > 0
        assert response["model_name"] == "local-llama-model"

@pytest.mark.asyncio
async def test_llama_api_error_handling_chat(llama_adapter_no_init_load):
    # Ensure model is "loaded" with a mock that will raise an error on chat_completion
    mock_client_instance = MagicMock()
    mock_client_instance.create_chat_completion = MagicMock(side_effect=Exception("Simulated Llama Chat Error"))
    
    with patch("src.adapters.llama_adapter.Llama", return_value=mock_client_instance):
        adapter = LlamaCppAdapter(model_path="/fake/model.gguf")
        # await adapter._ensure_model_loaded() # This would replace client with mock_client_instance
        adapter.client = mock_client_instance # Directly set the mocked client

        messages = [{"role": "user", "content": "Test error for Llama chat"}]
        # Patch asyncio.to_thread to simulate the error coming from the threaded execution
        with patch("asyncio.to_thread", new_callable=AsyncMock) as mock_to_thread:
            mock_to_thread.side_effect = Exception("Simulated Llama Chat Error via to_thread")
            response = await adapter.chat(messages)
            assert "error" in response
            assert "Simulated Llama Chat Error via to_thread" in response["error"]

@pytest.mark.asyncio
async def test_llama_generate_with_grammar_success(llama_adapter_no_init_load):
    mock_client_instance = MagicMock()
    mock_completion_response = {"choices": [{"text": "{\"key\": \"value\"}"}], "usage": {"prompt_tokens":10, "completion_tokens":5, "total_tokens":15}}
    mock_client_instance.create_completion = MagicMock(return_value=mock_completion_response)

    mock_grammar_instance = MagicMock()
    
    with patch("src.adapters.llama_adapter.Llama", return_value=mock_client_instance) as mock_llama_class, \
         patch("src.adapters.llama_adapter.LlamaGrammar.from_file", return_value=mock_grammar_instance) as mock_from_file, \
         patch("os.path.exists", return_value=True) as mock_path_exists:
        
        adapter = LlamaCppAdapter(model_path="/fake/model.gguf")
        adapter.client = mock_client_instance # Pre-set the client

        # Create a dummy grammar file for the test
        dummy_grammar_path = "/tmp/dummy_grammar.gbnf"
        with open(dummy_grammar_path, "w") as f:
            f.write("root ::= \"{\" \"key\": \"value\" \"}\"")

        response = await adapter.generate("prompt", grammar_path=dummy_grammar_path)
        
        mock_from_file.assert_called_once_with(dummy_grammar_path)
        # Check that create_completion was called with the grammar object
        args, kwargs = mock_client_instance.create_completion.call_args
        assert kwargs.get("grammar") is mock_grammar_instance
        assert response["generated_text"] == "{\"key\": \"value\"}"

        os.remove(dummy_grammar_path) # Clean up dummy file

@pytest.mark.asyncio
async def test_llama_generate_with_grammar_load_fail(llama_adapter_no_init_load):
    mock_client_instance = MagicMock()
    with patch("src.adapters.llama_adapter.Llama", return_value=mock_client_instance) as mock_llama_class_fail, \
         patch("src.adapters.llama_adapter.LlamaGrammar.from_file", side_effect=Exception("Grammar load failed")) as mock_from_file_fail, \
         patch("os.path.exists", return_value=True) as mock_path_exists_fail:

        adapter = LlamaCppAdapter(model_path="/fake/model.gguf")
        adapter.client = mock_client_instance

        response = await adapter.generate("prompt", grammar_path="/fake/grammar.gbnf")
        assert "error" in response
        assert "Could not load grammar: Grammar load failed" in response["error"]

