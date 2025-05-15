import os
import asyncio
from typing import Any, Dict, List, Optional

from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from dotenv import load_dotenv

from src.core.base_adapter import BaseAdapter

load_dotenv()

class MistralAdapter(BaseAdapter):
    """
    Adapter for interacting with Mistral AI API.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "mistral-small-latest", **kwargs):
        super().__init__(api_key=api_key, model_name=model_name, **kwargs)
        self.api_key = api_key or os.getenv("MISTRAL_API_KEY")
        if not self.api_key:
            raise ValueError("Mistral API key not provided or found in environment variables.")
        self.client = MistralClient(api_key=self.api_key)

    async def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = 1024,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 1.0,
        random_seed: Optional[int] = None,
        safe_prompt: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate text using Mistral AI. This is a convenience wrapper around the chat method,
        as Mistral primarily offers chat completions.
        """
        messages = [{"role": "user", "content": prompt}] # BaseAdapter expects List[Dict[str,str]]
        
        return await self.chat(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            random_seed=random_seed,
            safe_prompt=safe_prompt,
            **kwargs
        )

    async def chat(
        self,
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = 1024,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 1.0,
        random_seed: Optional[int] = None,
        stream: bool = False, 
        safe_prompt: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Engage in a chat conversation using Mistral AI chat completion endpoint.
        Uses asyncio.to_thread to run the synchronous Mistral client call.
        """
        mistral_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]
        try:
            if stream:
                # Stream handling would require a different approach (e.g., async generator)
                # and the sync client.chat_stream() method.
                # For now, indicating not fully implemented for this base return type.
                return {"error": "Streaming not fully implemented for this return type with sync client in this adapter version", "model_name": self.model_name}

            # Run the synchronous client.chat method in a separate thread
            chat_response = await asyncio.to_thread(
                self.client.chat,
                model=self.model_name,
                messages=mistral_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                random_seed=random_seed,
                safe_prompt=safe_prompt,
                 **kwargs
            )

            response_message = chat_response.choices[0].message
            usage_info = chat_response.usage
            
            return {
                "response": response_message.content,
                "role": response_message.role,
                "model_name": self.model_name,
                "usage": {
                    "prompt_tokens": usage_info.prompt_tokens,
                    "completion_tokens": usage_info.completion_tokens,
                    "total_tokens": usage_info.total_tokens
                } if usage_info else None
            }
        except Exception as e:
            # import loguru # Placeholder for actual logging
            # loguru.logger.error(f"Mistral API error (chat): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def embed(
        self,
        texts: List[str],
        embedding_model: str = "mistral-embed", 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate embeddings for a list of texts using Mistral AI embedding endpoint.
        Uses asyncio.to_thread to run the synchronous Mistral client call.
        """
        try:
            # Run the synchronous client.embeddings method in a separate thread
            embeddings_response = await asyncio.to_thread(
                self.client.embeddings,
                model=embedding_model,
                input=texts,
                **kwargs
            )

            embeddings = [item.embedding for item in embeddings_response.data]
            usage_info = embeddings_response.usage

            return {
                "embeddings": embeddings,
                "model_name": embedding_model,
                "usage": {
                    "prompt_tokens": usage_info.prompt_tokens,
                    "total_tokens": usage_info.total_tokens # Embeddings only have prompt_tokens which are total here
                } if usage_info else None
            }
        except Exception as e:
            # import loguru
            # loguru.logger.error(f"Mistral API error (embed): {e}")
            return {"error": str(e), "model_name": embedding_model}

# Example Usage (for testing purposes)
async def main():
    if not os.getenv("MISTRAL_API_KEY"):
        print("Error: MISTRAL_API_KEY not found. Please set it in .env or environment.")
        return

    adapter = MistralAdapter(model_name="mistral-tiny") # Use a smaller model for testing

    try:
        # Test Chat
        print("--- Testing Mistral Chat ---")
        chat_messages = [
            {"role": "user", "content": "Quelle est la capitale de la France?"}
        ]
        chat_response = await adapter.chat(chat_messages)
        print(f"Mistral Chat Response: {chat_response}\n")

        # Test Embeddings
        print("--- Testing Mistral Embeddings ---")
        texts_to_embed = ["Bonjour le monde", "Mistral AI est cool"]
        embed_response = await adapter.embed(texts_to_embed)
        if "embeddings" in embed_response and embed_response["embeddings"]:
            print(f"Embeddings generated for {len(embed_response['embeddings'])} texts.")
            if embed_response["embeddings"]:
                 print(f"Dimension of first embedding: {len(embed_response['embeddings'][0])}")
        else:
            print(f"Mistral Embedding Response: {embed_response}")
        print("\n")

        # Test Generate (simulated with chat)
        print("--- Testing Mistral Generate (simulated with chat) ---")
        generate_response = await adapter.generate(prompt="Écris un court poème sur l´IA.", max_tokens=60)
        print(f"Mistral Generate Response: {generate_response}\n")

    except Exception as e:
        print(f"An error occurred during Mistral example usage: {e}")

if __name__ == "__main__":
    asyncio.run(main())

