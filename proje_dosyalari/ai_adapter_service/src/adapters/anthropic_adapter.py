import os
import asyncio
from typing import Any, Dict, List, Optional

from anthropic import AsyncAnthropic
from dotenv import load_dotenv

from src.core.base_adapter import BaseAdapter
# from src.core.utils import AnthropicTokenCounter # Assuming a utility for token counting

load_dotenv() # Load environment variables from .env file

class AnthropicAdapter(BaseAdapter):
    """
    Adapter for interacting with Anthropic Claude API.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "claude-3-opus-20240229", **kwargs):
        super().__init__(api_key=api_key, model_name=model_name, **kwargs)
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key not provided or found in environment variables.")
        self.client = AsyncAnthropic(api_key=self.api_key)
        # self.token_counter = AnthropicTokenCounter(model_name=self.model_name) # Initialize token counter

    async def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = 1024,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 1.0,
        top_k: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate text using Anthropic's message creation endpoint (simulating a direct prompt).
        Anthropic primarily uses a chat-like message structure.
        """
        messages = [{"role": "user", "content": prompt}]
        # System prompt can be passed via kwargs if needed, e.g., kwargs.get("system_prompt")
        system_prompt = kwargs.pop("system_prompt", None)
        try:
            response = await self.client.messages.create(
                model=self.model_name,
                max_tokens=max_tokens,
                messages=messages,
                system=system_prompt,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                **kwargs
            )
            generated_text = ""
            if response.content and isinstance(response.content, list):
                for block in response.content:
                    if hasattr(block, 'text'):
                        generated_text += block.text
            
            # Anthropic API v1 for messages does not return token usage directly in the main response object in the same way as OpenAI.
            # Usage might be available in headers or need to be calculated/estimated.
            # For now, returning None for usage.
            return {
                "generated_text": generated_text.strip(),
                "model_name": self.model_name,
                "usage": {"input_tokens": response.usage.input_tokens, "output_tokens": response.usage.output_tokens} if hasattr(response, 'usage') and response.usage else None
            }
        except Exception as e:
            # loguru.error(f"Anthropic API error (generate): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = 1024,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 1.0,
        top_k: Optional[int] = None,
        stream: bool = False, # Streaming not fully implemented in this base return type
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Engage in a chat conversation using Anthropic's message creation endpoint.
        """
        try:
            response = await self.client.messages.create(
                model=self.model_name,
                max_tokens=max_tokens,
                messages=messages,
                system=system_prompt,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                stream=stream,
                **kwargs
            )
            if stream:
                # Basic handling for stream, actual implementation would yield parts
                return {"error": "Streaming not fully implemented for this return type", "model_name": self.model_name}

            response_text = ""
            if response.content and isinstance(response.content, list):
                for block in response.content:
                    if hasattr(block, 'text'):
                        response_text += block.text
            
            return {
                "response": response_text.strip(),
                "role": response.role, # 'assistant'
                "model_name": self.model_name,
                "usage": {"input_tokens": response.usage.input_tokens, "output_tokens": response.usage.output_tokens} if hasattr(response, 'usage') and response.usage else None
            }
        except Exception as e:
            # loguru.error(f"Anthropic API error (chat): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def embed(
        self,
        texts: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Anthropic's primary models (Claude) are not designed for direct text embedding generation via their public API in the same way as OpenAI's embedding models.
        This method will return an error or a not implemented message.
        """
        # loguru.warning("Anthropic Claude models do not offer a direct embedding API endpoint similar to OpenAI.")
        return {
            "error": "Embedding generation is not directly supported by Anthropic Claude models via this adapter.",
            "embeddings": [],
            "model_name": self.model_name
        }

# Example Usage (for testing purposes)
async def main():
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY not found. Please set it in .env or environment.")
        return

    adapter = AnthropicAdapter(model_name="claude-3-haiku-20240307") # Using a faster model for testing

    # Test Chat
    print("--- Testing Anthropic Chat ---")
    chat_messages = [
        {"role": "user", "content": "What is the capital of Germany?"}
    ]
    chat_response = await adapter.chat(chat_messages, system_prompt="You are a concise and factual assistant.")
    print(f"Chat Response: {chat_response}\n")

    # Test Generate (simulated with chat)
    print("--- Testing Anthropic Generate (simulated with chat) ---")
    generate_response = await adapter.generate(prompt="Write a very short story about a robot learning to paint.", max_tokens=70)
    print(f"Generate Response: {generate_response}\n")
    
    # Test Embed (expected to be not supported)
    print("--- Testing Anthropic Embed ---")
    embed_response = await adapter.embed(texts=["text1", "text2"])
    print(f"Embed Response: {embed_response}\n")

if __name__ == "__main__":
    # Example .env file content:
    # ANTHROPIC_API_KEY="your_anthropic_api_key_here"
    asyncio.run(main())

