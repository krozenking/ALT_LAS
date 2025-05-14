from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class BaseAdapter(ABC):
    """
    Abstract base class for AI model adapters.
    Defines a common interface for interacting with various AI models.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None, **kwargs):
        """
        Initialize the adapter.

        Args:
            api_key: The API key for the AI service (if applicable).
            model_name: The specific model to use (if applicable).
            **kwargs: Additional keyword arguments for specific adapter configurations.
        """
        self.api_key = api_key
        self.model_name = model_name
        self.config = kwargs

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate text based on a given prompt.

        Args:
            prompt: The input text prompt.
            max_tokens: The maximum number of tokens to generate.
            temperature: The sampling temperature.
            **kwargs: Additional model-specific parameters.

        Returns:
            A dictionary containing the generated text and other relevant information.
        """
        pass

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]: # In a streaming scenario, this might return an AsyncGenerator
        """
        Engage in a chat conversation with the model.

        Args:
            messages: A list of message dictionaries (e.g., [{"role": "user", "content": "Hello"}]).
            max_tokens: The maximum number of tokens to generate.
            temperature: The sampling temperature.
            stream: Whether to stream the response.
            **kwargs: Additional model-specific parameters.

        Returns:
            A dictionary containing the model's response and other relevant information.
            If stream is True, this method should ideally return an asynchronous generator.
        """
        pass

    @abstractmethod
    async def embed(
        self,
        texts: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate embeddings for a list of texts.

        Args:
            texts: A list of input texts to embed.
            **kwargs: Additional model-specific parameters.

        Returns:
            A dictionary containing the embeddings and other relevant information.
        """
        pass

    def get_model_name(self) -> Optional[str]:
        """
        Returns the name of the model being used by the adapter.
        """
        return self.model_name

    def get_config(self) -> Dict[str, Any]:
        """
        Returns the configuration of the adapter.
        """
        return self.config

