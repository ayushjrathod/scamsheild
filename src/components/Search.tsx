import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Analysis } from "../types";
import { AnalysisResult } from "./AnalysisResult";
import { FileUpload } from "./FileUpload";

function Search() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to analyze audio");
      }

      const result: Analysis = await response.json();

      // Validate the response matches our expected type
      if (!result.id || !result.status) {
        throw new Error("Invalid response format from server");
      }

      setAnalysis(result);
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze the audio file");
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-8">
          {!analysis && <FileUpload onFileSelect={handleFileSelect} />}

          {isAnalyzing && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-lg text-gray-700">Analyzing your audio file...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <>
              <AnalysisResult analysis={analysis} />
              <div className="text-center">
                <button onClick={() => setAnalysis(null)} className="text-blue-600 hover:text-blue-800 font-medium">
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
