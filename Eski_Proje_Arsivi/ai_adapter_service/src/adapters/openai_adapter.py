import os
import asyncio
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI
from dotenv import load_dotenv

from src.core.base_adapter import BaseAdapter
# from src.core.utils import TiktokenCounter # Assuming a utility for token counting

load_dotenv() # Load environment variables from .env file

class OpenAIAdapter(BaseAdapter):
    """
    Adapter for interacting with OpenAI API (GPT-3.5, GPT-4, Embeddings).
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-3.5-turbo", **kwargs):
        super().__init__(api_key=api_key, model_name=model_name, **kwargs)
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided or found in environment variables.")
        self.client = AsyncOpenAI(api_key=self.api_key)
        # self.token_counter = TiktokenCounter(model_name=self.model_name) # Initialize token counter

    async def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = 150,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 1.0,
        frequency_penalty: Optional[float] = 0.0,
        presence_penalty: Optional[float] = 0.0,
        stop: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate text using OpenAI's completion endpoint (davinci, etc. - though chat models are preferred now).
        For newer models, using the chat() method is generally recommended.
        """
        try:
            response = await self.client.completions.create(
                model=self.model_name, # This might need to be an older model if using completions endpoint
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                presence_penalty=presence_penalty,
                stop=stop,
                **kwargs
            )
            generated_text = response.choices[0].text.strip()
            # usage = response.usage # Contains prompt_tokens, completion_tokens, total_tokens
            return {
                "generated_text": generated_text,
                "model_name": self.model_name,
                "usage": dict(response.usage) if hasattr(response, 'usage') and response.usage else None
            }
        except Exception as e:
            # loguru.error(f"OpenAI API error (generate): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = 1024,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 1.0,
        stream: bool = False, # Streaming not fully implemented in this base return type
        **kwargs
    ) -> Dict[str, Any]:
        """
        Engage in a chat conversation using OpenAI's chat completion endpoint.
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stream=stream,
                **kwargs
            )
            if stream:
                # Basic handling for stream, actual implementation would yield parts
                # For now, let's collect and return if stream=True, though not ideal for true streaming
                collected_content = ""
                # This part needs to be adapted if true async generator is desired
                # async for chunk in response:
                #     content = chunk.choices[0].delta.content
                #     if content:
                #         collected_content += content
                # return {"response": collected_content, "model_name": self.model_name, "usage": None} # Usage not typically available per chunk
                return {"error": "Streaming not fully implemented for this return type", "model_name": self.model_name}

            response_message = response.choices[0].message
            # usage = response.usage
            return {
                "response": response_message.content,
                "role": response_message.role,
                "model_name": self.model_name,
                "usage": dict(response.usage) if hasattr(response, 'usage') and response.usage else None
            }
        except Exception as e:
            # loguru.error(f"OpenAI API error (chat): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def embed(
        self,
        texts: List[str],
        embedding_model: str = "text-embedding-ada-002",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate embeddings for a list of texts using OpenAI's embedding endpoint.
        """
        try:
            response = await self.client.embeddings.create(
                input=texts,
                model=embedding_model, # Specific model for embeddings
                **kwargs
            )
            embeddings = [item.embedding for item in response.data]
            # usage = response.usage
            return {
                "embeddings": embeddings,
                "model_name": embedding_model, # Report the embedding model used
                "usage": dict(response.usage) if hasattr(response, 'usage') and response.usage else None
            }
        except Exception as e:
            # loguru.error(f"OpenAI API error (embed): {e}")
            return {"error": str(e), "model_name": embedding_model}

# Example Usage (for testing purposes, typically not run directly from adapter file)
async def main():
    # Ensure OPENAI_API_KEY is set in your .env file or environment
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found. Please set it in .env or environment.")
        return

    adapter = OpenAIAdapter(model_name="gpt-3.5-turbo")

    # Test Chat
    print("--- Testing Chat ---")
    chat_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"}
    ]
    chat_response = await adapter.chat(chat_messages)
    print(f"Chat Response: {chat_response}\n")

    # Test Embeddings
    print("--- Testing Embeddings ---")
    texts_to_embed = ["Hello world", "OpenAI is cool"]
    embed_response = await adapter.embed(texts_to_embed)
    if "embeddings" in embed_response and embed_response["embeddings"]:
        print(f"Embeddings generated for {len(embed_response['embeddings'])} texts.")
        print(f"Dimension of first embedding: {len(embed_response['embeddings'][0])}")
    else:
        print(f"Embedding Response: {embed_response}")
    print("\n")

    # Test Generate (using a chat model for completion-like behavior via chat endpoint)
    # Note: The 'generate' method using client.completions.create is for older models.
    # For gpt-3.5-turbo and newer, chat completions are standard.
    # We can simulate a 'generate' like behavior with a single user message.
    print("--- Testing Generate (simulated with chat) ---")
    generate_prompt_messages = [
        {"role": "user", "content": "Write a short poem about AI."}
    ]
    generate_response = await adapter.chat(generate_prompt_messages, max_tokens=50)
    print(f"Generate Response: {generate_response}\n")

if __name__ == "__main__":
    # This is for manual testing. In a real app, you'd import and use the adapter.
    # Ensure you have an .env file with OPENAI_API_KEY or it's set in your environment.
    # Example .env file content:
    # OPENAI_API_KEY="your_openai_api_key_here"
    asyncio.run(main())

