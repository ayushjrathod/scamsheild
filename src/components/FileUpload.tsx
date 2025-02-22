import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AudioRecorder } from "./AudioRecorder";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
      >
        <input {...getInputProps()} />
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-lg font-medium text-gray-700">
          {isDragActive ? "Drop the audio file here" : "Drag & drop an audio file here"}
        </p>
        <p className="mt-2 text-sm text-gray-500">or click to select a file</p>
        <p className="mt-1 text-xs text-gray-400">Supported formats: MP3, WAV</p>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-gray-50 text-sm text-gray-500">Or</span>
            </div>
          </div>
        </div>
      </div>

      <AudioRecorder onRecordingComplete={onFileSelect} />
    </div>
  );
}
