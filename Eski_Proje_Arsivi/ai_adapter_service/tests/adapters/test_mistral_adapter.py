import pytest
import os
from unittest.mock import AsyncMock, patch
from dotenv import load_dotenv

from src.adapters.mistral_adapter import MistralAdapter
from mistralai.models.chat_completion import ChatMessage, ChatCompletion, Choice, UsageInfo
from mistralai.models.embeddings import EmbeddingResponse, Embedding, UsageInfo as EmbeddingUsageInfo

load_dotenv() # Load .env for API keys if not set in environment

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
pytestmark = pytest.mark.skipif(not MISTRAL_API_KEY, reason="MISTRAL_API_KEY not set in environment")

@pytest.fixture
def mistral_adapter():
    return MistralAdapter(model_name="mistral-tiny") # Use a small model for tests

@pytest.mark.asyncio
async def test_mistral_chat_completion(mistral_adapter):
    messages = [
        {"role": "user", "content": "Hello Mistral!"}
    ]
    response = await mistral_adapter.chat(messages)
    
    assert "response" in response
    assert isinstance(response["response"], str)
    assert response["role"] == "assistant"
    assert response["model_name"] == "mistral-tiny"
    assert "usage" in response
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "completion_tokens" in response["usage"]
        assert "total_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_mistral_generate_completion(mistral_adapter):
    prompt = "Generate a short test completion using Mistral."
    response = await mistral_adapter.generate(prompt, max_tokens=20)
    
    assert "response" in response # generate calls chat, so response structure is similar
    assert isinstance(response["response"], str)
    assert len(response["response"]) > 0
    assert response["model_name"] == "mistral-tiny"
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "completion_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_mistral_embedding_generation(mistral_adapter):
    texts = ["Test sentence 1 for Mistral embedding.", "Another test sentence for Mistral."]
    response = await mistral_adapter.embed(texts)
    
    assert "embeddings" in response
    assert isinstance(response["embeddings"], list)
    assert len(response["embeddings"]) == len(texts)
    for emb in response["embeddings"]:
        assert isinstance(emb, list)
        assert len(emb) > 0 # Check if embedding vector is not empty
    assert response["model_name"] == "mistral-embed"
    assert "usage" in response
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "total_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_mistral_adapter_missing_api_key():
    with patch.dict(os.environ, {"MISTRAL_API_KEY": ""}):
        with pytest.raises(ValueError, match="Mistral API key not provided or found"): 
            MistralAdapter()

@pytest.mark.asyncio
async def test_mistral_api_error_handling_chat(mistral_adapter):
    # Mock the client.chat method to raise an exception
    # Since client.chat is called via asyncio.to_thread, we need to ensure the mock is effective.
    # Patching the client instance method directly should work.
    mistral_adapter.client.chat = AsyncMock(side_effect=Exception("Simulated Mistral Chat Error"))
    # However, the client.chat is synchronous, so the mock should also be synchronous if we are patching the actual client method.
    # Let's patch the asyncio.to_thread call to control what it returns or raises.
    with patch("asyncio.to_thread", new_callable=AsyncMock) as mock_to_thread:
        mock_to_thread.side_effect = Exception("Simulated Mistral Chat Error via to_thread")
        messages = [{"role": "user", "content": "Test error for Mistral chat"}]
        response = await mistral_adapter.chat(messages)
        
        assert "error" in response
        assert "Simulated Mistral Chat Error via to_thread" in response["error"]

@pytest.mark.asyncio
async def test_mistral_api_error_handling_embed(mistral_adapter):
    with patch("asyncio.to_thread", new_callable=AsyncMock) as mock_to_thread:
        mock_to_thread.side_effect = Exception("Simulated Mistral Embed Error via to_thread")
        texts = ["test error embed for mistral"]
        response = await mistral_adapter.embed(texts)

        assert "error" in response
        assert "Simulated Mistral Embed Error via to_thread" in response["error"]

