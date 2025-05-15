import pytest
from unittest.mock import AsyncMock, MagicMock

from src.core.base_adapter import BaseAdapter # Assuming src is in PYTHONPATH or tests are run from project root

# A concrete implementation for testing purposes
class ConcreteAdapter(BaseAdapter):
    async def generate(self, prompt: str, max_tokens: int | None = None, temperature: float | None = None, **kwargs) -> dict:
        return {"generated_text": f"generated from {prompt}"}

    async def chat(self, messages: list[dict[str, str]], max_tokens: int | None = None, temperature: float | None = None, stream: bool = False, **kwargs) -> dict:
        return {"response": f"chat response to {messages[-1]['content']}"}

    async def embed(self, texts: list[str], **kwargs) -> dict:
        return {"embeddings": [[0.1, 0.2] for _ in texts]}

@pytest.mark.asyncio
async def test_base_adapter_can_be_subclassed_and_methods_called():
    adapter = ConcreteAdapter(api_key="test_key", model_name="test_model")
    
    assert adapter.get_model_name() == "test_model"
    assert adapter.get_config() == {}

    gen_result = await adapter.generate(prompt="hello")
    assert "generated_text" in gen_result
    assert gen_result["generated_text"] == "generated from hello"

    chat_result = await adapter.chat(messages=[{"role": "user", "content": "world"}])
    assert "response" in chat_result
    assert chat_result["response"] == "chat response to world"

    embed_result = await adapter.embed(texts=["text1", "text2"])
    assert "embeddings" in embed_result
    assert len(embed_result["embeddings"]) == 2

def test_base_adapter_abstract_methods_exist():
    # Check if abstract methods are defined
    assert hasattr(BaseAdapter, "generate")
    assert hasattr(BaseAdapter, "chat")
    assert hasattr(BaseAdapter, "embed")
    # Check if they are marked as abstract
    assert BaseAdapter.generate.__isabstractmethod__ == True
    assert BaseAdapter.chat.__isabstractmethod__ == True
    assert BaseAdapter.embed.__isabstractmethod__ == True


