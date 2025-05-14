"""
Audio API endpoints for AI Orchestrator.
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query

from ...models.audio import AudioRequest, AudioResponse, TranscriptionResult
from ...services.audio_service import AudioService, get_audio_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/transcribe", response_model=TranscriptionResult)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    model_id: Optional[str] = Form("whisper-small"),
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Transcribe speech in an audio file to text.
    """
    try:
        audio_data = await audio.read()
        result = await audio_service.transcribe_audio(
            audio_data=audio_data,
            language=language,
            model_id=model_id
        )
        return result
    except Exception as e:
        logger.error(f"Error during audio transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")

@router.post("/text-to-speech", response_model=AudioResponse)
async def text_to_speech(
    text: str = Form(...),
    voice: str = Form("default"),
    model_id: Optional[str] = Form(None),
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Convert text to speech using text-to-speech models.
    """
    try:
        result = await audio_service.text_to_speech(
            text=text,
            voice=voice,
            model_id=model_id
        )
        return result
    except Exception as e:
        logger.error(f"Error during text-to-speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text-to-speech failed: {str(e)}")

@router.post("/audio-classification", response_model=AudioResponse)
async def classify_audio(
    audio: UploadFile = File(...),
    model_id: Optional[str] = Form(None),
    top_k: int = Form(5),
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Classify audio using audio classification models.
    """
    try:
        audio_data = await audio.read()
        result = await audio_service.classify_audio(
            audio_data=audio_data,
            model_id=model_id,
            top_k=top_k
        )
        return result
    except Exception as e:
        logger.error(f"Error during audio classification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio classification failed: {str(e)}")

@router.post("/speaker-diarization", response_model=AudioResponse)
async def diarize_speakers(
    audio: UploadFile = File(...),
    num_speakers: Optional[int] = Form(None),
    model_id: Optional[str] = Form(None),
    audio_service: AudioService = Depends(get_audio_service)
):
    """
    Perform speaker diarization on an audio file (identify who spoke when).
    """
    try:
        audio_data = await audio.read()
        result = await audio_service.diarize_speakers(
            audio_data=audio_data,
            num_speakers=num_speakers,
            model_id=model_id
        )
        return result
    except Exception as e:
        logger.error(f"Error during speaker diarization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speaker diarization failed: {str(e)}")
