"""
Tests for the Voice Processing Service.
"""

import os
import pytest
import asyncio
import numpy as np
import base64
from unittest.mock import patch, MagicMock
import tempfile
import wave

# Import the service to test
from ai_orchestrator.src.services.voice_processing import VoiceProcessingService

# Sample test audio as base64 (empty WAV file)
SAMPLE_AUDIO_BASE64 = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="

@pytest.fixture
def voice_processing_service():
    """Fixture to create a VoiceProcessingService instance for testing."""
    service = VoiceProcessingService()
    return service

@pytest.fixture
def sample_audio_bytes():
    """Fixture to create a sample audio bytes for testing."""
    # Create a simple WAV file with silence
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        with wave.open(temp_path, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(16000)  # 16 kHz
            wav_file.writeframes(b'\x00' * 32000)  # 1 second of silence
        
        with open(temp_path, 'rb') as f:
            audio_bytes = f.read()
        
        return audio_bytes
    
    finally:
        # Clean up temporary file
        os.unlink(temp_path)

@pytest.mark.asyncio
async def test_initialize(voice_processing_service):
    """Test the initialization of the VoiceProcessingService."""
    result = await voice_processing_service.initialize()
    assert result is True
    assert voice_processing_service.stats["total_requests"] == 0
    assert voice_processing_service.stats["successful_requests"] == 0
    assert voice_processing_service.stats["failed_requests"] == 0

@pytest.mark.asyncio
@patch('speech_recognition.Recognizer.recognize_google')
@patch('speech_recognition.AudioFile')
@patch('speech_recognition.Recognizer.record')
async def test_recognize_speech(mock_record, mock_audio_file, mock_recognize_google, voice_processing_service, sample_audio_bytes):
    """Test speech recognition."""
    # Mock the speech recognition
    mock_recognize_google.return_value = "Hello world"
    mock_audio_data = MagicMock()
    mock_record.return_value = mock_audio_data
    
    # Set SPEECH_RECOGNITION_AVAILABLE to True for testing
    with patch('ai_orchestrator.src.services.voice_processing.SPEECH_RECOGNITION_AVAILABLE', True):
        result = await voice_processing_service.recognize_speech(
            sample_audio_bytes,
            parameters={"language": "en-US", "engine": "google"}
        )
        
        assert result["success"] is True
        assert result["text"] == "Hello world"
        assert result["language"] == "en-US"
        assert result["engine"] == "google"
        assert "processing_time" in result
        
        # Verify the stats were updated
        assert voice_processing_service.stats["total_requests"] == 1
        assert voice_processing_service.stats["successful_requests"] == 1
        assert voice_processing_service.stats["speech_recognition_requests"] == 1

@pytest.mark.asyncio
@patch('gtts.gTTS')
async def test_synthesize_speech(mock_gtts, voice_processing_service):
    """Test speech synthesis."""
    # Mock the text-to-speech
    mock_tts_instance = MagicMock()
    mock_gtts.return_value = mock_tts_instance
    
    # Create a sample MP3 file
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
        temp_file.write(b'sample mp3 data')
        temp_path = temp_file.name
    
    try:
        # Mock the save method to use our sample file
        def mock_save(path):
            # Do nothing, our sample file is already created
            pass
        
        mock_tts_instance.save.side_effect = mock_save
        
        # Set GTTS_AVAILABLE to True for testing
        with patch('ai_orchestrator.src.services.voice_processing.GTTS_AVAILABLE', True):
            # Patch open to return our sample file
            with patch('builtins.open', return_value=open(temp_path, 'rb')):
                result = await voice_processing_service.synthesize_speech(
                    "Hello world",
                    parameters={"language": "en", "slow": False}
                )
                
                assert result["success"] is True
                assert "audio" in result
                assert result["text"] == "Hello world"
                assert result["language"] == "en"
                assert result["format"] == "mp3"
                assert "processing_time" in result
                
                # Verify the stats were updated
                assert voice_processing_service.stats["total_requests"] == 1
                assert voice_processing_service.stats["successful_requests"] == 1
                assert voice_processing_service.stats["text_to_speech_requests"] == 1
    
    finally:
        # Clean up temporary file
        os.unlink(temp_path)

@pytest.mark.asyncio
@patch('pydub.AudioSegment.from_file')
@patch('pydub.AudioSegment.export')
async def test_process_audio_convert(mock_export, mock_from_file, voice_processing_service, sample_audio_bytes):
    """Test audio format conversion."""
    # Mock the audio processing
    mock_audio = MagicMock()
    mock_from_file.return_value = mock_audio
    mock_audio.set_frame_rate.return_value = mock_audio
    mock_audio.set_channels.return_value = mock_audio
    
    # Create a sample WAV file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(b'sample wav data')
        temp_path = temp_file.name
    
    try:
        # Mock the export method
        def mock_export_func(path, format):
            # Write sample data to the path
            with open(path, 'wb') as f:
                f.write(b'sample wav data')
        
        mock_export.side_effect = mock_export_func
        
        # Set PYDUB_AVAILABLE to True for testing
        with patch('ai_orchestrator.src.services.voice_processing.PYDUB_AVAILABLE', True):
            # Patch open to return our sample file
            with patch('builtins.open', return_value=open(temp_path, 'rb')):
                result = await voice_processing_service.process_audio(
                    sample_audio_bytes,
                    operation="convert",
                    parameters={"format": "wav", "sample_rate": 16000, "channels": 1}
                )
                
                assert result["success"] is True
                assert "audio" in result
                assert result["format"] == "wav"
                assert result["sample_rate"] == 16000
                assert result["channels"] == 1
                assert "processing_time" in result
                
                # Verify the stats were updated
                assert voice_processing_service.stats["total_requests"] == 1
                assert voice_processing_service.stats["successful_requests"] == 1
                assert voice_processing_service.stats["audio_processing_requests"] == 1
    
    finally:
        # Clean up temporary file
        os.unlink(temp_path)

@pytest.mark.asyncio
@patch('pydub.AudioSegment.from_file')
@patch('pydub.AudioSegment.export')
async def test_process_audio_trim(mock_export, mock_from_file, voice_processing_service, sample_audio_bytes):
    """Test audio trimming."""
    # Mock the audio processing
    mock_audio = MagicMock()
    mock_from_file.return_value = mock_audio
    
    # Mock the slicing
    mock_audio.__getitem__.return_value = mock_audio
    mock_audio.__len__.return_value = 5000  # 5 seconds
    
    # Create a sample WAV file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(b'sample wav data')
        temp_path = temp_file.name
    
    try:
        # Mock the export method
        def mock_export_func(path, format):
            # Write sample data to the path
            with open(path, 'wb') as f:
                f.write(b'sample wav data')
        
        mock_export.side_effect = mock_export_func
        
        # Set PYDUB_AVAILABLE to True for testing
        with patch('ai_orchestrator.src.services.voice_processing.PYDUB_AVAILABLE', True):
            # Patch open to return our sample file
            with patch('builtins.open', return_value=open(temp_path, 'rb')):
                result = await voice_processing_service.process_audio(
                    sample_audio_bytes,
                    operation="trim",
                    parameters={"start_ms": 1000, "end_ms": 3000, "format": "wav"}
                )
                
                assert result["success"] is True
                assert "audio" in result
                assert result["format"] == "wav"
                assert result["duration_ms"] == 5000
                assert "processing_time" in result
                
                # Verify the stats were updated
                assert voice_processing_service.stats["total_requests"] == 1
                assert voice_processing_service.stats["successful_requests"] == 1
                assert voice_processing_service.stats["audio_processing_requests"] == 1
    
    finally:
        # Clean up temporary file
        os.unlink(temp_path)

@pytest.mark.asyncio
async def test_process_audio_invalid_operation(voice_processing_service, sample_audio_bytes):
    """Test processing audio with an invalid operation."""
    # Set PYDUB_AVAILABLE to True for testing
    with patch('ai_orchestrator.src.services.voice_processing.PYDUB_AVAILABLE', True):
        # Mock _load_audio_pydub to avoid actual file operations
        with patch.object(voice_processing_service, '_load_audio_pydub', return_value=MagicMock()):
            result = await voice_processing_service.process_audio(
                sample_audio_bytes,
                operation="invalid_operation"
            )
            
            assert result["success"] is False
            assert "error" in result
            assert "processing_time" in result
            
            # Verify the stats were updated
            assert voice_processing_service.stats["total_requests"] == 1
            assert voice_processing_service.stats["successful_requests"] == 0
            assert voice_processing_service.stats["failed_requests"] == 1

@pytest.mark.asyncio
async def test_get_stats(voice_processing_service):
    """Test getting service statistics."""
    # Add some sample stats
    voice_processing_service.stats["total_requests"] = 10
    voice_processing_service.stats["successful_requests"] = 8
    voice_processing_service.stats["failed_requests"] = 2
    voice_processing_service.stats["processing_times"] = [0.1, 0.2, 0.3]
    
    stats = voice_processing_service.get_stats()
    
    assert stats["total_requests"] == 10
    assert stats["successful_requests"] == 8
    assert stats["failed_requests"] == 2
    assert stats["average_processing_time"] == 0.2
    assert "processing_times" not in stats  # Should be removed to reduce size

@pytest.mark.asyncio
@patch('pydub.AudioSegment.from_file')
@patch('pydub.AudioSegment.export')
async def test_cache_functionality(mock_export, mock_from_file, voice_processing_service, sample_audio_bytes):
    """Test the caching functionality."""
    # Mock the audio processing
    mock_audio = MagicMock()
    mock_from_file.return_value = mock_audio
    mock_audio.set_frame_rate.return_value = mock_audio
    mock_audio.set_channels.return_value = mock_audio
    
    # Create a sample WAV file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(b'sample wav data')
        temp_path = temp_file.name
    
    try:
        # Mock the export method
        def mock_export_func(path, format):
            # Write sample data to the path
            with open(path, 'wb') as f:
                f.write(b'sample wav data')
        
        mock_export.side_effect = mock_export_func
        
        # Set PYDUB_AVAILABLE to True for testing
        with patch('ai_orchestrator.src.services.voice_processing.PYDUB_AVAILABLE', True):
            # Patch open to return our sample file
            with patch('builtins.open', return_value=open(temp_path, 'rb')):
                # Process audio twice with the same parameters
                result1 = await voice_processing_service.process_audio(
                    sample_audio_bytes,
                    operation="convert",
                    parameters={"format": "wav", "sample_rate": 16000, "channels": 1}
                )
                
                # Second call should use cache
                result2 = await voice_processing_service.process_audio(
                    sample_audio_bytes,
                    operation="convert",
                    parameters={"format": "wav", "sample_rate": 16000, "channels": 1}
                )
                
                assert result1["success"] is True
                assert result2["success"] is True
                assert result1["audio"] == result2["audio"]
                
                # Verify the stats were updated correctly (only one successful request despite two calls)
                assert voice_processing_service.stats["total_requests"] == 2
                assert voice_processing_service.stats["successful_requests"] == 1
                assert voice_processing_service.stats["audio_processing_requests"] == 2
    
    finally:
        # Clean up temporary file
        os.unlink(temp_path)
