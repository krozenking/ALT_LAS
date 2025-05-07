import pytest
import os
from unittest.mock import AsyncMock, patch
from dotenv import load_dotenv

from src.adapters.openai_adapter import OpenAIAdapter

load_dotenv() # Load .env for API keys if not set in environment

# Skip tests if OPENAI_API_KEY is not available, as they would fail.
# In a CI environment, this key should be set as a secret.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
pytestmark = pytest.mark.skipif(not OPENAI_API_KEY, reason="OPENAI_API_KEY not set in environment")

@pytest.fixture
def openai_adapter():
    return OpenAIAdapter(model_name="gpt-3.5-turbo") # Use a common, cost-effective model for tests

@pytest.mark.asyncio
async def test_openai_chat_completion(openai_adapter):
    messages = [
        {"role": "system", "content": "You are a test assistant."},
        {"role": "user", "content": "Hello OpenAI!"}
    ]
    response = await openai_adapter.chat(messages)
    
    assert "response" in response
    assert isinstance(response["response"], str)
    assert response["role"] == "assistant"
    assert response["model_name"] == "gpt-3.5-turbo"
    assert "usage" in response
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "completion_tokens" in response["usage"]
        assert "total_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_openai_embedding_generation(openai_adapter):
    texts = ["Test sentence 1 for OpenAI embedding.", "Another test sentence."]
    response = await openai_adapter.embed(texts, embedding_model="text-embedding-ada-002")
    
    assert "embeddings" in response
    assert isinstance(response["embeddings"], list)
    assert len(response["embeddings"]) == len(texts)
    for emb in response["embeddings"]:
        assert isinstance(emb, list)
        assert len(emb) > 0 # Check if embedding vector is not empty
    assert response["model_name"] == "text-embedding-ada-002"
    assert "usage" in response
    if response.get("usage"):
        assert "prompt_tokens" in response["usage"]
        assert "total_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_openai_generate_completion_with_chat_model(openai_adapter):
    # Simulating generate with a chat model as the old completions endpoint is legacy
    prompt_messages = [
        {"role": "user", "content": "Generate a short test completion."}
    ]
    response = await openai_adapter.chat(prompt_messages, max_tokens=10) # Using chat for generate
    
    assert "response" in response
    assert isinstance(response["response"], str)
    assert len(response["response"]) > 0
    assert response["model_name"] == "gpt-3.5-turbo"

@pytest.mark.asyncio
async def test_openai_adapter_missing_api_key():
    with patch.dict(os.environ, {"OPENAI_API_KEY": ""}): # Temporarily unset API key
        with pytest.raises(ValueError, match="OpenAI API key not provided or found"): # Use match for regex or substring
            OpenAIAdapter()

@pytest.mark.asyncio
async def test_openai_api_error_handling_chat(openai_adapter):
    # Mock the client to raise an exception
    openai_adapter.client = AsyncMock()
    openai_adapter.client.chat.completions.create = AsyncMock(side_effect=Exception("Simulated API Error"))
    
    messages = [{"role": "user", "content": "Test error"}]
    response = await openai_adapter.chat(messages)
    
    assert "error" in response
    assert "Simulated API Error" in response["error"]

@pytest.mark.asyncio
async def test_openai_api_error_handling_embed(openai_adapter):
    openai_adapter.client = AsyncMock()
    openai_adapter.client.embeddings.create = AsyncMock(side_effect=Exception("Simulated Embedding Error"))

    texts = ["test error embed"]
    response = await openai_adapter.embed(texts)

    assert "error" in response
    assert "Simulated Embedding Error" in response["error"]

