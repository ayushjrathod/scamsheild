import { Analysis } from "../types";

interface AnalysisResultProps {
  analysis: Analysis;
  transcription: string | null;
}

export function AnalysisResult({ analysis, transcription }: AnalysisResultProps) {
  const confidence = (analysis.score * 100).toFixed(2);
  const isScam = analysis.label === "spam";

  return (
    <div className="space-y-8">
      {transcription && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcription</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Result</h2>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isScam ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {isScam ? "Potential Scam" : "Likely Legitimate"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-2">Confidence Score</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${isScam ? "bg-red-600" : "bg-green-600"}`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{confidence}% confident</p>
          </div>

          {analysis.analysis_details && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{analysis.analysis_details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
