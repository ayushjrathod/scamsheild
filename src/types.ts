export interface Analysis {
  prediction: string;
  confidence: number;
  transcription: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: Analysis;
}
