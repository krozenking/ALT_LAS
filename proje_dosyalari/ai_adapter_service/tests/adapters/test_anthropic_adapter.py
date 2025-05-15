import pytest
import os
from unittest.mock import AsyncMock, patch
from dotenv import load_dotenv

from src.adapters.anthropic_adapter import AnthropicAdapter

load_dotenv() # Load .env for API keys if not set in environment

# Skip tests if ANTHROPIC_API_KEY is not available, as they would fail.
# In a CI environment, this key should be set as a secret.
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
pytestmark = pytest.mark.skipif(not ANTHROPIC_API_KEY, reason="ANTHROPIC_API_KEY not set in environment")

@pytest.fixture
def anthropic_adapter():
    # Using a fast and common model for tests
    return AnthropicAdapter(model_name="claude-3-haiku-20240307")

@pytest.mark.asyncio
async def test_anthropic_chat_completion(anthropic_adapter):
    messages = [
        {"role": "user", "content": "Hello Anthropic!"}
    ]
    system_prompt = "You are a test assistant for Anthropic."
    response = await anthropic_adapter.chat(messages, system_prompt=system_prompt)
    
    assert "response" in response
    assert isinstance(response["response"], str)
    assert response["role"] == "assistant"
    assert response["model_name"] == "claude-3-haiku-20240307"
    assert "usage" in response
    if response.get("usage"):
        assert "input_tokens" in response["usage"]
        assert "output_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_anthropic_generate_completion(anthropic_adapter):
    prompt = "Generate a short test completion using Anthropic."
    response = await anthropic_adapter.generate(prompt, max_tokens=20)
    
    assert "generated_text" in response
    assert isinstance(response["generated_text"], str)
    assert len(response["generated_text"]) > 0
    assert response["model_name"] == "claude-3-haiku-20240307"
    if response.get("usage"):
        assert "input_tokens" in response["usage"]
        assert "output_tokens" in response["usage"]

@pytest.mark.asyncio
async def test_anthropic_embedding_not_supported(anthropic_adapter):
    texts = ["Test sentence 1 for Anthropic embedding."]
    response = await anthropic_adapter.embed(texts)
    
    assert "error" in response
    assert "not directly supported" in response["error"]
    assert response["model_name"] == "claude-3-haiku-20240307"
    assert response["embeddings"] == []

@pytest.mark.asyncio
async def test_anthropic_adapter_missing_api_key():
    with patch.dict(os.environ, {"ANTHROPIC_API_KEY": ""}): # Temporarily unset API key
        with pytest.raises(ValueError, match="Anthropic API key not provided or found"): # Use match for regex or substring
            AnthropicAdapter()

@pytest.mark.asyncio
async def test_anthropic_api_error_handling_chat(anthropic_adapter):
    anthropic_adapter.client = AsyncMock()
    anthropic_adapter.client.messages.create = AsyncMock(side_effect=Exception("Simulated Anthropic Chat Error"))
    
    messages = [{"role": "user", "content": "Test error for Anthropic chat"}]
    response = await anthropic_adapter.chat(messages)
    
    assert "error" in response
    assert "Simulated Anthropic Chat Error" in response["error"]

@pytest.mark.asyncio
async def test_anthropic_api_error_handling_generate(anthropic_adapter):
    anthropic_adapter.client = AsyncMock()
    anthropic_adapter.client.messages.create = AsyncMock(side_effect=Exception("Simulated Anthropic Generate Error"))

    prompt = "Test error for Anthropic generate"
    response = await anthropic_adapter.generate(prompt)

    assert "error" in response
    assert "Simulated Anthropic Generate Error" in response["error"]

