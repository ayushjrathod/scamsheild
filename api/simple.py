import os
import uuid
import tempfile
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import speech_recognition as sr
from pydub import AudioSegment

# Initialize the FastAPI app with a title
app = FastAPI(title="ScamShield API")

# Enable CORS (update allowed origins before deploying to production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Analysis(BaseModel):
    """
    Pydantic model for analysis results.
    """
    id: str
    status: str
    confidence: float
    reasons: List[str]
    timestamp: str
    audioFileName: str
    transcription: str

# Suspicious keywords to search for in transcriptions
SUSPICIOUS_KEYWORDS = [
    "otp",
    "anydesk",
    "teamviewer",
    "urgent",
    "bank account",
    "password",
    "credit card",
    "cvv",
    "social security",
]

def transcribe_audio(uploaded_file: UploadFile) -> str:
    """
    Handle audio transcription with support for WebM format.
    """
    suffix = os.path.splitext(uploaded_file.filename)[1].lower()
    temp_filename = ""
    wav_temp = ""
    
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(uploaded_file.file.read())
            temp_filename = tmp.name

        # Convert to WAV for speech recognition
        wav_temp = temp_filename + ".wav"
        
        if suffix in ['.webm', '.mp3']:
            audio = AudioSegment.from_file(temp_filename)
            audio.export(wav_temp, format="wav")
            os.remove(temp_filename)  # Remove original file
            temp_filename = wav_temp

        # Transcribe
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_filename) as source:
            audio_data = recognizer.record(source)
            transcription = recognizer.recognize_google(audio_data)
            return transcription
            
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return ""
    finally:
        # Cleanup temporary files
        for filename in [temp_filename, wav_temp]:
            if filename and os.path.exists(filename):
                try:
                    os.remove(filename)
                except:
                    pass

def analyze_transcription(transcription: str):
    """
    Analyze the transcription for suspicious keywords.

    Args:
        transcription (str): The text transcription of the audio file.

    Returns:
        tuple: Contains (status, confidence, explanation) based on keyword analysis.
    """
    lower_transcription = transcription.lower()
    suspicious_found = [
        f"Mentioned '{keyword}'" 
        for keyword in SUSPICIOUS_KEYWORDS 
        if keyword.lower() in lower_transcription
    ]
    # Changed to lowercase to match frontend expectations
    status = "suspicious" if suspicious_found else "not suspicious"
    confidence = 0.92 if suspicious_found else 0.85
    explanation = suspicious_found if suspicious_found else ["No sensitive information detected"]
    return status, confidence, explanation

@app.post("/api/analyze", response_model=Analysis)
async def analyze_audio(file: UploadFile = File(...)):
    """
    Endpoint to analyze an audio file for potential scam indicators.
    Processes the file by transcribing it and analyzing the transcription for suspicious keywords.

    Args:
        file (UploadFile): The audio file uploaded by the user.

    Returns:
        Analysis: A detailed analysis including a unique ID, status, confidence score,
                  explanation, timestamp, original filename, and transcription.
    """
    try:
        # Process the audio file to get transcription text
        transcription = transcribe_audio(file)
        # Analyze the transcription for suspicious keywords
        status, confidence, explanation = analyze_transcription(transcription)
        return Analysis(
            id=str(uuid.uuid4()),
            status=status,
            confidence=confidence,
            reasons=explanation,
            timestamp=datetime.utcnow().isoformat(),
            audioFileName=file.filename,
            transcription=transcription
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify that the API is running.
    
    Returns:
        dict: A simple dictionary indicating API status.
    """
    return {"status": "healthy"}
