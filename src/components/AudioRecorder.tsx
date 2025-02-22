import { useRef, useState } from "react";
import { transcribeAudio } from "../utils/groq";

// Add this function at the top level, outside the component
async function convertWebMToWav(webmBlob: Blob): Promise<File> {
  // Create an audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Convert blob to array buffer
  const arrayBuffer = await webmBlob.arrayBuffer();

  // Decode the audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Create an offline context for rendering
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // Create a buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  // Render the audio
  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV format
  const wavBlob = await new Promise<Blob>((resolve) => {
    const length = renderedBuffer.length;
    const numberOfChannels = renderedBuffer.numberOfChannels;
    const sampleRate = renderedBuffer.sampleRate;
    const wavDataView = createWavDataView(length, numberOfChannels, sampleRate);
    const audioData = new Float32Array(length * numberOfChannels);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = renderedBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        audioData[i * numberOfChannels + channel] = channelData[i];
      }
    }

    wavDataView.setFloat32Array(44, audioData);
    resolve(new Blob([wavDataView], { type: "audio/wav" }));
  });

  return new File([wavBlob], `recording-${Date.now()}.wav`, { type: "audio/wav" });
}

// Helper function to create WAV header
function createWavDataView(length: number, numberOfChannels: number, sampleRate: number): DataView {
  const buffer = new ArrayBuffer(44 + length * numberOfChannels * 4);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * numberOfChannels * 4, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // subchunk1size
  view.setUint16(20, 3, true); // format (3 for IEEE float)
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 4, true); // byterate
  view.setUint16(32, numberOfChannels * 4, true); // blockalign
  view.setUint16(34, 32, true); // bitspersample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, length * numberOfChannels * 4, true);

  return view;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Add setFloat32Array method to DataView prototype if it doesn't exist
if (!(DataView.prototype as any).setFloat32Array) {
  (DataView.prototype as any).setFloat32Array = function (offset: number, array: Float32Array) {
    for (let i = 0; i < array.length; i++) {
      this.setFloat32(offset + i * 4, array[i], true);
    }
  };
}

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Specify audio format options for better compatibility
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsPreparing(true);
        try {
          // Create blob with proper MIME type
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          // Convert WebM to WAV
          const wavFile = await convertWebMToWav(audioBlob);
          const url = URL.createObjectURL(audioBlob); // Keep WebM for preview

          setAudioURL(url);
          setRecordedFile(wavFile); // Store the WAV file
        } catch (error) {
          console.error("Error creating audio file:", error);
          alert("Failed to process recording");
        } finally {
          setIsPreparing(false);
          // Stop all tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      // Set shorter timeslices for more frequent ondataavailable events
      mediaRecorder.start(100);
      setIsRecording(true);
      setAudioURL(null);
      setRecordedFile(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAnalyze = async () => {
    if (recordedFile) {
      try {
        // Create formData for the recorded file
        const formData = new FormData();
        formData.append("file", recordedFile);

        // First get the transcription
        const transcriptionText = await transcribeAudio(recordedFile);
        formData.append("transcription", transcriptionText);

        // Send to backend for prediction
        const response = await fetch("http://localhost:8000/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to analyze recording");
        }

        // Pass the file to parent component for further processing
        onRecordingComplete(recordedFile);
      } catch (error) {
        console.error("Error processing recording:", error);
        alert("Failed to process recording. Please try again.");
      }
    }
  };

  const handleReset = () => {
    setAudioURL(null);
    setRecordedFile(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {audioURL && <audio ref={audioRef} src={audioURL} onEnded={handleAudioEnded} className="hidden" />}

      {!isRecording && !audioURL && (
        <button
          onClick={startRecording}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-400 transition-colors"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          <span>Start Recording</span>
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors animate-pulse"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <span>Stop Recording</span>
        </button>
      )}

      {isPreparing && (
        <div className="flex items-center space-x-2 px-4 py-2">
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 4v6h6" />
            <path d="M23 20v-6h-6" />
            <path d="M3.51 9a9 9 0 1 1-2.44 5.5" />
          </svg>
          <span>Preparing recording...</span>
        </div>
      )}

      {audioURL && !isPreparing && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 9a9 9 0 1 0 2.13-5.36L1 10" />
              </svg>
              <span>Record Again</span>
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>Analyze Recording</span>
          </button>
        </div>
      )}
    </div>
  );
}
