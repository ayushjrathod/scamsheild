import React from 'react';
import { Analysis } from '../types';
import { AlertTriangle, CheckCircle, FileAudio, Clock } from 'lucide-react';

interface AnalysisResultProps {
  analysis: Analysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const isSuspicious = analysis.status === 'suspicious';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileAudio className="w-6 h-6 text-gray-500" />
          <h3 className="text-lg font-semibold">{analysis.audioFileName}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {new Date(analysis.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      <div className={`p-4 rounded-lg mb-6 ${
        isSuspicious ? 'bg-red-50' : 'bg-green-50'
      }`}>
        <div className="flex items-center space-x-3">
          {isSuspicious ? (
            <AlertTriangle className="w-6 h-6 text-red-500" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
          <div>
            <h4 className={`font-semibold ${
              isSuspicious ? 'text-red-700' : 'text-green-700'
            }`}>
              {isSuspicious ? 'Suspicious Call Detected' : 'Safe Call'}
            </h4>
            <p className="text-sm text-gray-600">
              Confidence: {(analysis.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Analysis Reasons:</h4>
        <ul className="space-y-2">
          {analysis.reasons.map((reason, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Call Transcription:</h4>
        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
          {analysis.transcription}
        </p>
      </div>
    </div>
  );
}