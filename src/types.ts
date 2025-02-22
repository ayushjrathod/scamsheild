export interface Analysis {
  prediction: string;
  confidence: number;
  transcription: string;
  analysis_details: string; // Add this field for the Groq analysis
}

export interface AnalysisResponse {
  success: boolean;
  data: Analysis;
}
