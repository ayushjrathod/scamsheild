# ScamShield – Detecting Suspicious Calls Using AI

## Overview

ScamShield is an AI-powered system that analyzes recorded phone calls to detect suspicious activities by processing audio files.

## Project Structure

- **/api/**: FastAPI backend for audio transcription and analysis.
- **/src/**: React frontend.
- **/src/types.ts**: TypeScript definitions.
- **README.md**: This file.

## Running the Backend

1. Navigate to the `api` folder.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart speechrecognition
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

## Running the Frontend

1. Navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

## Testing the Solution

- Use the frontend to upload an audio file (MP3 or WAV).
- The system processes the audio, transcribes it, and returns a binary classification along with an explanation.
- Alternatively, use cURL or Postman to POST an audio file to the `/api/analyze` endpoint.

## Notes

- Update CORS and endpoint URLs as needed before deploying to production.
- Ensure your environment has audio processing capabilities for SpeechRecognition.
