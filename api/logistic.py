import os
import re
import string
import uuid
import tempfile
import json
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import speech_recognition as sr
from pydub import AudioSegment

# Imports for ML model and pipeline
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import numpy as np

# --- Utility functions ---
def preprocess_text(text: str) -> str:
    """
    Cleans text by converting to lowercase, removing punctuation, and extra whitespace.
    """
    text = text.lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def load_training_data(filepath: str):
    """
    Loads training data from a JSON file.
    The JSON file should contain a list of objects with keys 'text' and 'label'.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    texts = []
    labels = []
    for entry in data:
        if "text" in entry and "label" in entry:
            texts.append(entry["text"])
            labels.append(entry["label"])
    return texts, labels

def get_top_contributing_features(text: str, top_n: int = 3):
    """
    Computes the top contributing features for the 'spam' class.
    Returns a list of tuples (feature, contribution_score).
    """
    cleaned_text = preprocess_text(text)
    tfidf = model_pipeline.named_steps['tfidf']
    clf = model_pipeline.named_steps['clf']
    X = tfidf.transform([cleaned_text])
    # Determine the index for the "spam" class
    classes = clf.classes_
    if "spam" in classes:
        spam_index = list(classes).index("spam")
    else:
        spam_index = 0
    # For binary classification, if two classes exist, use the coefficient corresponding to spam.
    coef = clf.coef_[spam_index] if len(classes) > 1 else clf.coef_[0]
    feature_names = tfidf.get_feature_names_out()
    X_array = X.toarray()[0]
    # Contribution = tfidf weight * coefficient value
    contributions = X_array * coef
    # Get indices sorted in descending order of contribution
    top_indices = np.argsort(contributions)[::-1]
    top_features = []
    count = 0
    for idx in top_indices:
        # Only consider features with a positive contribution toward the spam prediction
        if contributions[idx] > 0:
            top_features.append((feature_names[idx], round(contributions[idx], 3)))
            count += 1
            if count >= top_n:
                break
    return top_features

# --- Load and train the spam (fraud) detection model using output.json ---
training_file = "output.json"  # Ensure output.json is in your working directory
training_data, training_labels = load_training_data(training_file)
cleaned_training_data = [preprocess_text(text) for text in training_data]

# Create a pipeline with TF-IDF (using unigrams and bigrams) and Logistic Regression
model_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words="english", ngram_range=(1, 2))),
    ('clf', LogisticRegression(max_iter=1000, random_state=42))
])
model_pipeline.fit(cleaned_training_data, training_labels)
# --- End of model training ---

# Initialize FastAPI
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

def transcribe_audio(uploaded_file: UploadFile) -> str:
    """
    Transcribes the uploaded audio file.
    Converts to WAV if necessary and uses Google Speech Recognition.
    """
    suffix = os.path.splitext(uploaded_file.filename)[1].lower()
    temp_filename = ""
    wav_temp = ""
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(uploaded_file.file.read())
            temp_filename = tmp.name

        # Convert to WAV if needed
        wav_temp = temp_filename + ".wav"
        if suffix in ['.webm', '.mp3']:
            audio = AudioSegment.from_file(temp_filename)
            audio.export(wav_temp, format="wav")
            os.remove(temp_filename)
            temp_filename = wav_temp

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
                except Exception:
                    pass

def analyze_transcription(transcription: str):
    """
    Analyzes the transcription using the trained ML pipeline.
    Returns a tuple: (prediction, confidence, explanation)
    where:
      - prediction is "spam" or "legitimate"
      - confidence is the probability for the spam class
      - explanation is a list of analysis reasons.
    """
    cleaned_text = preprocess_text(transcription)
    prediction = model_pipeline.predict([cleaned_text])[0]
    proba = model_pipeline.predict_proba([cleaned_text])[0]
    
    clf = model_pipeline.named_steps['clf']
    classes = clf.classes_
    if "spam" in classes:
        spam_index = list(classes).index("spam")
        confidence = proba[spam_index]
    else:
        confidence = 0.0

    explanation = []
    if prediction == "spam":
        explanation.append("Detected spam/fraud language patterns based on training data.")
        # Provide top contributing features as analysis reasons.
        top_features = get_top_contributing_features(transcription, top_n=3)
        if top_features:
            features_str = ", ".join([f"'{word}' (score: {score})" for word, score in top_features])
            explanation.append(f"Top features contributing to spam prediction: {features_str}.")
    else:
        explanation.append("No spam/fraud language patterns detected based on training data.")
    return prediction, confidence, explanation

@app.post("/api/analyze", response_model=Analysis)
async def analyze_audio_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to analyze an audio file for potential scam/spam indicators.
    Processes the file by transcribing it and classifying the text using the improved ML pipeline.
    
    Returns:
        Analysis: Detailed analysis including a unique ID, status, confidence score, explanation,
                  timestamp, original filename, and the transcription.
    """
    try:
        transcription = transcribe_audio(file)
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
    Health check endpoint.
    
    Returns:
        dict: API status.
    """
    return {"status": "healthy"}
