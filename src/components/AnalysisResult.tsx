import { AlertTriangle, CheckCircle, FileAudio } from "lucide-react";
import { Analysis } from "../types";

interface AnalysisResultProps {
  analysis: Analysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const isSuspicious = analysis.prediction === "scam";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileAudio className="w-6 h-6 text-gray-500" />
          <h3 className="text-lg font-semibold">Analysis Result</h3>
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-6 ${isSuspicious ? "bg-red-50" : "bg-green-50"}`}>
        <div className="flex items-center space-x-3">
          {isSuspicious ? (
            <AlertTriangle className="w-6 h-6 text-red-500" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
          <div>
            <h4 className={`font-semibold ${isSuspicious ? "text-red-700" : "text-green-700"}`}>
              {isSuspicious ? "Scam Call Detected" : "Legitimate Call"}
            </h4>
            <p className="text-sm text-gray-600">Confidence: {(analysis.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Call Transcription:</h4>
        <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
          {analysis.transcription}
        </pre>
      </div>
    </div>
  );
}
