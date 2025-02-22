import { useState } from "react";
import toast from "react-hot-toast";
import { Analysis } from "../types";
import { analyzeTranscription, transcribeAudio } from "../utils/groq";
import { AnalysisResult } from "./AnalysisResult";
import { FileUpload } from "./FileUpload";

function Search() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsTranscribing(true);
    setIsAnalyzing(true);

    try {
      // First get transcription from Groq
      const transcription = await transcribeAudio(file);
      setIsTranscribing(false);

      // Get detailed analysis from Groq
      const analysisDetails = await analyzeTranscription(transcription);

      // Then send for prediction
      const formData = new FormData();
      formData.append("file", file);
      formData.append("transcription", transcription);

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze transcription");
      }

      const result: Analysis = await response.json();
      setAnalysis({
        ...result,
        analysis_details: analysisDetails,
      });

      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process the audio file");
      setAnalysis(null);
    } finally {
      setIsTranscribing(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-amber-50 rounded-xl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-8">
          {!analysis && <FileUpload onFileSelect={handleFileSelect} />}

          {(isAnalyzing || isTranscribing) && (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-lg text-amber-900">
                {isTranscribing ? "Transcribing audio..." : "Analyzing content..."}
              </p>
              <p className="text-sm text-amber-600/80">This may take a few moments</p>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <>
              <AnalysisResult analysis={analysis} />
              <div className="text-center">
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-amber-600 hover:text-amber-800 font-medium transition-colors duration-300"
                >
                  Analyze Another Call
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
