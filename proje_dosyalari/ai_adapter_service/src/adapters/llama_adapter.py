import os
import asyncio
from typing import Any, Dict, List, Optional

from llama_cpp import Llama, LlamaGrammar
from dotenv import load_dotenv

from src.core.base_adapter import BaseAdapter

load_dotenv()

class LlamaCppAdapter(BaseAdapter):
    """
    Adapter for interacting with local models via llama-cpp-python.
    """

    def __init__(self, model_path: Optional[str] = None, model_name: str = "local-llama-model", **kwargs):
        super().__init__(api_key=None, model_name=model_name, **kwargs) # No API key for local models
        self.model_path = model_path or os.getenv("LLAMA_MODEL_PATH")
        if not self.model_path:
            raise ValueError("Llama model path not provided or found in LLAMA_MODEL_PATH env variable.")
        
        self.model_params = {
            "n_ctx": kwargs.get("n_ctx", 2048),
            "n_gpu_layers": kwargs.get("n_gpu_layers", 0), # Set to -1 to offload all layers to GPU if available
            "seed": kwargs.get("seed", -1), # -1 for random seed
            "verbose": kwargs.get("verbose", False),
        }
        self.client = None # Initialize client to None, load model on first use or explicitly
        # self.load_model() # Optionally load model on init, or lazily

    def load_model(self):
        """Loads the Llama model into memory."""
        if not self.client:
            try:
                self.client = Llama(model_path=self.model_path, **self.model_params)
                # import loguru
                # loguru.logger.info(f"Llama model loaded successfully from {self.model_path}")
            except Exception as e:
                # import loguru
                # loguru.logger.error(f"Failed to load Llama model from {self.model_path}: {e}")
                raise RuntimeError(f"Failed to load Llama model: {e}")

    async def _ensure_model_loaded(self):
        if not self.client:
            # llama-cpp-python model loading is synchronous
            await asyncio.to_thread(self.load_model)

    async def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = 128,
        temperature: Optional[float] = 0.8,
        top_p: Optional[float] = 0.95,
        top_k: Optional[int] = 40,
        repeat_penalty: Optional[float] = 1.1,
        stop: Optional[List[str]] = None,
        grammar_path: Optional[str] = None, # Path to a GBNF grammar file
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate text using the loaded Llama model (completion style).
        """
        await self._ensure_model_loaded()
        if not self.client:
            return {"error": "Llama model not loaded.", "model_name": self.model_name}

        llama_grammar = None
        if grammar_path:
            try:
                llama_grammar = await asyncio.to_thread(LlamaGrammar.from_file, grammar_path)
            except Exception as e:
                # loguru.logger.warning(f"Could not load grammar from {grammar_path}: {e}")
                return {"error": f"Could not load grammar: {e}", "model_name": self.model_name}

        try:
            # llama-cpp-python create_completion is synchronous
            response = await asyncio.to_thread(
                self.client.create_completion,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                repeat_penalty=repeat_penalty,
                stop=stop,
                grammar=llama_grammar,
                **kwargs
            )
            generated_text = response["choices"][0]["text"].strip()
            usage = response.get("usage", {})
            return {
                "generated_text": generated_text,
                "model_name": self.model_name,
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens"),
                    "completion_tokens": usage.get("completion_tokens"),
                    "total_tokens": usage.get("total_tokens")
                }
            }
        except Exception as e:
            # import loguru
            # loguru.logger.error(f"Llama model error (generate): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = 1024,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 0.95,
        top_k: Optional[int] = 40,
        repeat_penalty: Optional[float] = 1.1,
        stop: Optional[List[str]] = None,
        stream: bool = False, # Streaming not fully implemented in this base return type
        grammar_path: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Engage in a chat conversation using the loaded Llama model.
        """
        await self._ensure_model_loaded()
        if not self.client:
            return {"error": "Llama model not loaded.", "model_name": self.model_name}

        llama_grammar = None
        if grammar_path:
            try:
                llama_grammar = await asyncio.to_thread(LlamaGrammar.from_file, grammar_path)
            except Exception as e:
                # loguru.logger.warning(f"Could not load grammar from {grammar_path}: {e}")
                return {"error": f"Could not load grammar: {e}", "model_name": self.model_name}

        try:
            # llama-cpp-python create_chat_completion is synchronous
            response = await asyncio.to_thread(
                self.client.create_chat_completion,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                repeat_penalty=repeat_penalty,
                stop=stop,
                stream=stream,
                grammar=llama_grammar,
                **kwargs
            )

            if stream:
                # This would need to be an async generator in a real streaming implementation
                return {"error": "Streaming not fully implemented for this return type", "model_name": self.model_name}

            response_message = response["choices"][0]["message"]
            usage = response.get("usage", {})
            return {
                "response": response_message["content"],
                "role": response_message["role"],
                "model_name": self.model_name,
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens"),
                    "completion_tokens": usage.get("completion_tokens"),
                    "total_tokens": usage.get("total_tokens")
                }
            }
        except Exception as e:
            # import loguru
            # loguru.logger.error(f"Llama model error (chat): {e}")
            return {"error": str(e), "model_name": self.model_name}

    async def embed(
        self,
        texts: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate embeddings for a list of texts using the loaded Llama model.
        Requires the model to be compiled with embedding support.
        """
        await self._ensure_model_loaded()
        if not self.client:
            return {"error": "Llama model not loaded.", "model_name": self.model_name}
        
        if not hasattr(self.client, "embed") or not callable(self.client.embed):
            return {"error": "Embedding not supported by this Llama model/configuration.", "model_name": self.model_name}

        try:
            # llama-cpp-python embed is synchronous
            embeddings_list = await asyncio.to_thread(self.client.embed, texts, **kwargs)
            # Assuming client.embed returns a list of embeddings directly
            return {
                "embeddings": embeddings_list,
                "model_name": self.model_name,
                # llama-cpp-python embed method doesn't typically return token usage directly
                "usage": None 
            }
        except Exception as e:
            # import loguru
            # loguru.logger.error(f"Llama model error (embed): {e}")
            return {"error": str(e), "model_name": self.model_name}

# Example Usage (for testing purposes - requires a model file)
async def main():
    model_file_path = os.getenv("LLAMA_MODEL_PATH") # Set this in your .env or environment
    if not model_file_path:
        print("Error: LLAMA_MODEL_PATH not found. Please set it in .env or environment.")
        print("Skipping LlamaCppAdapter example.")
        return
    if not os.path.exists(model_file_path):
        print(f"Error: Model file not found at {model_file_path}")
        print("Skipping LlamaCppAdapter example.")
        return

    print(f"Attempting to load model from: {model_file_path}")
    adapter = LlamaCppAdapter(model_path=model_file_path, n_gpu_layers=-1, verbose=True) # Try to use GPU

    try:
        # Test Chat
        print("--- Testing Llama.cpp Chat ---")
        chat_messages = [
            {"role": "system", "content": "You are a helpful local assistant."},
            {"role": "user", "content": "What are the benefits of using local AI models?"}
        ]
        chat_response = await adapter.chat(chat_messages, max_tokens=100)
        print(f"Llama.cpp Chat Response: {chat_response}\n")

        # Test Generate
        print("--- Testing Llama.cpp Generate ---")
        generate_response = await adapter.generate(
            prompt="Write a short sentence about the future of AI:", 
            max_tokens=50
        )
        print(f"Llama.cpp Generate Response: {generate_response}\n")

        # Test Embeddings (if supported by the model)
        print("--- Testing Llama.cpp Embeddings ---")
        texts_to_embed = ["Local AI is powerful.", "Privacy is important."]
        embed_response = await adapter.embed(texts_to_embed)
        if "embeddings" in embed_response and embed_response["embeddings"]:
            print(f"Embeddings generated for {len(embed_response['embeddings'])} texts.")
            if embed_response["embeddings"]:
                 print(f"Dimension of first embedding: {len(embed_response['embeddings'][0])}")
        else:
            print(f"Llama.cpp Embedding Response: {embed_response}")
        print("\n")

    except Exception as e:
        print(f"An error occurred during LlamaCppAdapter example usage: {e}")
    finally:
        # Clean up the model if it was loaded
        if adapter.client:
            # llama-cpp-python doesn't have an explicit close/del method for the Llama object
            # It relies on Python's garbage collection. Setting to None might help.
            del adapter.client
            adapter.client = None
            # import loguru
            # loguru.logger.info("Llama model client dereferenced.")

if __name__ == "__main__":
    # Example .env file content:
    # LLAMA_MODEL_PATH="/path/to/your/model.gguf"
    asyncio.run(main())

