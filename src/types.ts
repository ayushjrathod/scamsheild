export interface Analysis {
  id: string;
  status: "suspicious" | "not suspicious"; // Note: backend returns "Suspicious" or "Not Suspicious"
  confidence: number;
  reasons: string[];
  timestamp: string;
  audioFileName: string;
  transcription: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: Analysis;
}
