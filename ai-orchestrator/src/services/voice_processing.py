"""
Voice Processing Service for AI Orchestrator.

This module provides voice processing capabilities including speech recognition,
text-to-speech synthesis, and audio processing.
"""

import os
import logging
import asyncio
import time
from typing import Dict, Any, List, Optional, Union, Tuple
import numpy as np
from datetime import datetime
import base64
import io
import json
import tempfile
import wave
import audioop

# Import optional dependencies with fallbacks
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False
    
try:
    import gtts
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

logger = logging.getLogger("ai_orchestrator.services.voice_processing")

class VoiceProcessingService:
    """Voice Processing Service for speech recognition, synthesis, and audio processing"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Voice Processing Service.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        self.models = {}
        self.stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "processing_times": [],
            "speech_recognition_requests": 0,
            "text_to_speech_requests": 0,
            "audio_processing_requests": 0
        }
        
        # Set default configurations
        self.speech_recognition_config = self.config.get("speech_recognition", {
            "language": "en-US",
            "timeout": 10,
            "phrase_time_limit": 10,
            "energy_threshold": 300,
            "dynamic_energy_threshold": True,
            "pause_threshold": 0.8,
            "cache_enabled": True,
            "cache_size": 50
        })
        
        self.text_to_speech_config = self.config.get("text_to_speech", {
            "language": "en",
            "slow": False,
            "cache_enabled": True,
            "cache_size": 100
        })
        
        self.audio_processing_config = self.config.get("audio_processing", {
            "sample_rate": 16000,
            "channels": 1,
            "format": "wav",
            "cache_enabled": True,
            "cache_size": 50
        })
        
        # Initialize caches
        self.speech_recognition_cache = {}
        self.text_to_speech_cache = {}
        self.audio_processing_cache = {}
        
        # Initialize recognizer if available
        self.recognizer = None
        if SPEECH_RECOGNITION_AVAILABLE:
            self.recognizer = sr.Recognizer()
            # Set recognizer properties from config
            self.recognizer.energy_threshold = self.speech_recognition_config.get("energy_threshold", 300)
            self.recognizer.dynamic_energy_threshold = self.speech_recognition_config.get("dynamic_energy_threshold", True)
            self.recognizer.pause_threshold = self.speech_recognition_config.get("pause_threshold", 0.8)
    
    async def initialize(self) -> bool:
        """
        Initialize the Voice Processing Service.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Initializing Voice Processing Service")
            
            # Check available dependencies
            if not SPEECH_RECOGNITION_AVAILABLE:
                logger.warning("SpeechRecognition library not available. Speech recognition functionality will be limited.")
            else:
                logger.info("SpeechRecognition library available.")
                
            if not PYDUB_AVAILABLE:
                logger.warning("Pydub library not available. Audio processing functionality will be limited.")
            else:
                logger.info("Pydub library available.")
                
            if not GTTS_AVAILABLE:
                logger.warning("gTTS library not available. Text-to-speech functionality will be limited.")
            else:
                logger.info("gTTS library available.")
            
            logger.info("Voice Processing Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing Voice Processing Service: {str(e)}")
            return False
    
    async def recognize_speech(
        self, 
        audio_data: Union[str, bytes, np.ndarray],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Recognize speech from audio data.
        
        Args:
            audio_data: Audio data as base64 string, bytes, or numpy array
            parameters: Recognition parameters
            
        Returns:
            Dictionary with recognition results and metadata
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        self.stats["speech_recognition_requests"] += 1
        
        try:
            # Check if speech recognition is available
            if not SPEECH_RECOGNITION_AVAILABLE:
                raise ImportError("SpeechRecognition library not available")
            
            # Convert audio data to AudioData object
            audio = await self._load_audio(audio_data)
            
            # Generate cache key if caching is enabled
            cache_key = None
            if self.speech_recognition_config.get("cache_enabled", True):
                cache_key = self._generate_cache_key(audio_data, "speech_recognition", parameters)
                cached_result = self.speech_recognition_cache.get(cache_key)
                if cached_result:
                    logger.debug("Cache hit for speech recognition operation")
                    return cached_result
            
            # Set recognition parameters
            parameters = parameters or {}
            language = parameters.get("language", self.speech_recognition_config.get("language", "en-US"))
            
            # Recognize speech using Google Speech Recognition
            text = None
            if parameters.get("engine", "google") == "google":
                text = self.recognizer.recognize_google(audio, language=language)
            elif parameters.get("engine", "google") == "sphinx":
                # Use CMU Sphinx (offline)
                try:
                    import pocketsphinx
                    text = self.recognizer.recognize_sphinx(audio, language=language)
                except ImportError:
                    logger.warning("Pocketsphinx not available, falling back to Google Speech Recognition")
                    text = self.recognizer.recognize_google(audio, language=language)
            else:
                # Default to Google Speech Recognition
                text = self.recognizer.recognize_google(audio, language=language)
            
            # Prepare result
            result = {
                "text": text,
                "language": language,
                "engine": parameters.get("engine", "google"),
                "success": True,
                "processing_time": time.time() - start_time
            }
            
            # Update cache if enabled
            if cache_key and self.speech_recognition_config.get("cache_enabled", True):
                # Manage cache size
                if len(self.speech_recognition_cache) >= self.speech_recognition_config.get("cache_size", 50):
                    # Remove oldest entry
                    oldest_key = next(iter(self.speech_recognition_cache))
                    del self.speech_recognition_cache[oldest_key]
                
                self.speech_recognition_cache[cache_key] = result
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["processing_times"].append(processing_time)
            self.stats["successful_requests"] += 1
            
            return result
            
        except Exception as e:
            logger.error(f"Error recognizing speech: {str(e)}")
            self.stats["failed_requests"] += 1
            
            return {
                "error": str(e),
                "success": False,
                "processing_time": time.time() - start_time
            }
    
    async def synthesize_speech(
        self, 
        text: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Synthesize speech from text.
        
        Args:
            text: Text to synthesize
            parameters: Synthesis parameters
            
        Returns:
            Dictionary with synthesized audio and metadata
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        self.stats["text_to_speech_requests"] += 1
        
        try:
            # Check if text-to-speech is available
            if not GTTS_AVAILABLE:
                raise ImportError("gTTS library not available")
            
            # Generate cache key if caching is enabled
            cache_key = None
            if self.text_to_speech_config.get("cache_enabled", True):
                cache_key = self._generate_cache_key(text, "text_to_speech", parameters)
                cached_result = self.text_to_speech_cache.get(cache_key)
                if cached_result:
                    logger.debug("Cache hit for text-to-speech operation")
                    return cached_result
            
            # Set synthesis parameters
            parameters = parameters or {}
            language = parameters.get("language", self.text_to_speech_config.get("language", "en"))
            slow = parameters.get("slow", self.text_to_speech_config.get("slow", False))
            
            # Create temporary file for audio
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Synthesize speech
            tts = gtts.gTTS(text=text, lang=language, slow=slow)
            tts.save(temp_path)
            
            # Read audio data
            with open(temp_path, "rb") as f:
                audio_data = f.read()
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            # Encode audio data as base64
            audio_base64 = base64.b64encode(audio_data).decode("utf-8")
            
            # Prepare result
            result = {
                "audio": f"data:audio/mp3;base64,{audio_base64}",
                "text": text,
                "language": language,
                "format": "mp3",
                "success": True,
                "processing_time": time.time() - start_time
            }
            
            # Update cache if enabled
            if cache_key and self.text_to_speech_config.get("cache_enabled", True):
                # Manage cache size
                if len(self.text_to_speech_cache) >= self.text_to_speech_config.get("cache_size", 100):
                    # Remove oldest entry
                    oldest_key = next(iter(self.text_to_speech_cache))
                    del self.text_to_speech_cache[oldest_key]
                
                self.text_to_speech_cache[cache_key] = result
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["processing_times"].append(processing_time)
            self.stats["successful_requests"] += 1
            
            return result
            
        except Exception as e:
            logger.error(f"Error synthesizing speech: {str(e)}")
            self.stats["failed_requests"] += 1
            
            return {
                "error": str(e),
                "success": False,
                "processing_time": time.time() - start_time
            }
    
    async def process_audio(
        self, 
        audio_data: Union[str, bytes, np.ndarray],
        operation: str = "convert",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process audio with various operations.
        
        Args:
            audio_data: Audio data as base64 string, bytes, or numpy array
            operation: Operation to perform (convert, trim, normalize, etc.)
            parameters: Operation-specific parameters
            
        Returns:
            Dictionary with processed audio and metadata
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        self.stats["audio_processing_requests"] += 1
        
        try:
            # Check if audio processing is available
            if not PYDUB_AVAILABLE:
                raise ImportError("Pydub library not available")
            
            # Load audio data
            audio = await self._load_audio_pydub(audio_data)
            
            # Generate cache key if caching is enabled
            cache_key = None
            if self.audio_processing_config.get("cache_enabled", True):
                cache_key = self._generate_cache_key(audio_data, operation, parameters)
                cached_result = self.audio_processing_cache.get(cache_key)
                if cached_result:
                    logger.debug(f"Cache hit for audio processing operation: {operation}")
                    return cached_result
            
            # Process audio based on operation
            parameters = parameters or {}
            result = {}
            
            if operation == "convert":
                # Convert audio format
                format = parameters.get("format", self.audio_processing_config.get("format", "wav"))
                sample_rate = parameters.get("sample_rate", self.audio_processing_config.get("sample_rate", 16000))
                channels = parameters.get("channels", self.audio_processing_config.get("channels", 1))
                
                # Set sample rate and channels
                audio = audio.set_frame_rate(sample_rate)
                audio = audio.set_channels(channels)
                
                # Export to specified format
                processed_audio = await self._export_audio(audio, format)
                
                result = {
                    "audio": processed_audio,
                    "format": format,
                    "sample_rate": sample_rate,
                    "channels": channels,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "trim":
                # Trim audio
                start_ms = parameters.get("start_ms", 0)
                end_ms = parameters.get("end_ms", len(audio))
                
                # Trim audio
                audio = audio[start_ms:end_ms]
                
                # Export to specified format
                format = parameters.get("format", self.audio_processing_config.get("format", "wav"))
                processed_audio = await self._export_audio(audio, format)
                
                result = {
                    "audio": processed_audio,
                    "format": format,
                    "duration_ms": len(audio),
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "normalize":
                # Normalize audio
                headroom_db = parameters.get("headroom_db", 0.1)
                
                # Normalize audio
                audio = audioop.normalize(audio._data, audio.sample_width, headroom_db)
                
                # Export to specified format
                format = parameters.get("format", self.audio_processing_config.get("format", "wav"))
                processed_audio = await self._export_audio(audio, format)
                
                result = {
                    "audio": processed_audio,
                    "format": format,
                    "headroom_db": headroom_db,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "change_speed":
                # Change audio speed
                speed_factor = parameters.get("speed_factor", 1.0)
                
                # Change speed
                if speed_factor != 1.0:
                    # Change frame rate to change speed
                    new_frame_rate = int(audio.frame_rate * speed_factor)
                    audio = audio._spawn(audio.raw_data, overrides={
                        "frame_rate": new_frame_rate
                    })
                    
                    # Reset frame rate to maintain pitch
                    if not parameters.get("change_pitch", False):
                        audio = audio.set_frame_rate(audio.frame_rate // speed_factor)
                
                # Export to specified format
                format = parameters.get("format", self.audio_processing_config.get("format", "wav"))
                processed_audio = await self._export_audio(audio, format)
                
                result = {
                    "audio": processed_audio,
                    "format": format,
                    "speed_factor": speed_factor,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            else:
                raise ValueError(f"Unsupported audio processing operation: {operation}")
            
            # Update cache if enabled
            if cache_key and self.audio_processing_config.get("cache_enabled", True):
                # Manage cache size
                if len(self.audio_processing_cache) >= self.audio_processing_config.get("cache_size", 50):
                    # Remove oldest entry
                    oldest_key = next(iter(self.audio_processing_cache))
                    del self.audio_processing_cache[oldest_key]
                
                self.audio_processing_cache[cache_key] = result
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["processing_times"].append(processing_time)
            self.stats["successful_requests"] += 1
            
            # Add processing time to result
            result["processing_time"] = processing_time
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            self.stats["failed_requests"] += 1
            
            return {
                "error": str(e),
                "operation": operation,
                "parameters": parameters or {},
                "success": False,
                "processing_time": time.time() - start_time
            }
    
    async def _load_audio(self, audio_data: Union[str, bytes, np.ndarray]) -> 'sr.AudioData':
        """
        Load audio data for speech recognition.
        
        Args:
            audio_data: Audio data as base64 string, bytes, or numpy array
            
        Returns:
            AudioData object for speech recognition
        """
        if not SPEECH_RECOGNITION_AVAILABLE:
            raise ImportError("SpeechRecognition library not available")
        
        if isinstance(audio_data, sr.AudioData):
            return audio_data
        
        # Convert to bytes if needed
        if isinstance(audio_data, str):
            # Check if it's a base64 string
            if audio_data.startswith(('data:audio/', 'base64:')):
                # Extract base64 data
                if audio_data.startswith('data:audio/'):
                    audio_data = audio_data.split(',', 1)[1]
                elif audio_data.startswith('base64:'):
                    audio_data = audio_data[7:]
                
                # Decode base64
                audio_data = base64.b64decode(audio_data)
            else:
                # Assume it's a file path
                if os.path.exists(audio_data):
                    with open(audio_data, 'rb') as f:
                        audio_data = f.read()
                else:
                    raise FileNotFoundError(f"Audio file not found: {audio_data}")
        
        # Convert numpy array to bytes if needed
        if isinstance(audio_data, np.ndarray):
            # Assume 16-bit PCM
            audio_data = audio_data.astype(np.int16).tobytes()
        
        # Create temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            # Write audio data to WAV file
            with wave.open(temp_path, 'wb') as wav_file:
                wav_file.setnchannels(1)  # Mono
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(16000)  # 16 kHz
                wav_file.writeframes(audio_data)
            
            # Load audio file with speech_recognition
            with sr.AudioFile(temp_path) as source:
                audio = self.recognizer.record(source)
            
            return audio
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
    
    async def _load_audio_pydub(self, audio_data: Union[str, bytes, np.ndarray]) -> 'AudioSegment':
        """
        Load audio data for processing with pydub.
        
        Args:
            audio_data: Audio data as base64 string, bytes, or numpy array
            
        Returns:
            AudioSegment object for processing
        """
        if not PYDUB_AVAILABLE:
            raise ImportError("Pydub library not available")
        
        if isinstance(audio_data, AudioSegment):
            return audio_data
        
        # Convert to bytes if needed
        if isinstance(audio_data, str):
            # Check if it's a base64 string
            if audio_data.startswith(('data:audio/', 'base64:')):
                # Extract base64 data
                if audio_data.startswith('data:audio/'):
                    audio_data = audio_data.split(',', 1)[1]
                elif audio_data.startswith('base64:'):
                    audio_data = audio_data[7:]
                
                # Decode base64
                audio_data = base64.b64decode(audio_data)
            else:
                # Assume it's a file path
                return AudioSegment.from_file(audio_data)
        
        # Convert numpy array to bytes if needed
        if isinstance(audio_data, np.ndarray):
            # Assume 16-bit PCM
            audio_data = audio_data.astype(np.int16).tobytes()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name
        
        try:
            # Load audio file with pydub
            audio = AudioSegment.from_file(temp_path)
            return audio
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
    
    async def _export_audio(self, audio: 'AudioSegment', format: str = "wav") -> str:
        """
        Export audio to specified format and return as base64 string.
        
        Args:
            audio: AudioSegment object
            format: Output format (wav, mp3, etc.)
            
        Returns:
            Base64 encoded audio string
        """
        if not PYDUB_AVAILABLE:
            raise ImportError("Pydub library not available")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            # Export audio to file
            audio.export(temp_path, format=format)
            
            # Read audio data
            with open(temp_path, "rb") as f:
                audio_data = f.read()
            
            # Encode as base64
            audio_base64 = base64.b64encode(audio_data).decode("utf-8")
            
            # Return with data URI prefix
            return f"data:audio/{format};base64,{audio_base64}"
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
    
    def _generate_cache_key(
        self, 
        data: Any,
        operation: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate cache key for operations.
        
        Args:
            data: Input data
            operation: Operation name
            parameters: Operation parameters
            
        Returns:
            Cache key string
        """
        # Create data hash
        if isinstance(data, str):
            data_hash = hash(data)
        elif isinstance(data, bytes):
            data_hash = hash(data)
        elif isinstance(data, np.ndarray):
            data_hash = hash(data.tobytes())
        else:
            data_hash = hash(str(data))
        
        # Create parameters hash
        params_str = json.dumps(parameters or {}, sort_keys=True)
        params_hash = hash(params_str)
        
        # Combine hashes
        return f"{operation}_{data_hash}_{params_hash}"
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get service statistics.
        
        Returns:
            Dictionary of statistics
        """
        stats = self.stats.copy()
        
        # Calculate average processing time
        if stats["processing_times"]:
            stats["average_processing_time"] = sum(stats["processing_times"]) / len(stats["processing_times"])
        else:
            stats["average_processing_time"] = 0
        
        # Remove raw processing times list to reduce size
        stats.pop("processing_times", None)
        
        return stats
