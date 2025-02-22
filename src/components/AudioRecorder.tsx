import { Loader2, Mic, Square, Play, Pause, Send, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

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
          const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
            type: "audio/webm",
            lastModified: Date.now(),
          });
          const url = URL.createObjectURL(audioBlob);

          setAudioURL(url);
          setRecordedFile(file);
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

  const handleAnalyze = () => {
    if (recordedFile) {
      onRecordingComplete(recordedFile);
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
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Mic className="w-5 h-5" />
          <span>Start Recording</span>
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors animate-pulse"
        >
          <Square className="w-5 h-5" />
          <span>Stop Recording</span>
        </button>
      )}

      {isPreparing && (
        <div className="flex items-center space-x-2 px-4 py-2">
          <Loader2 className="w-5 h-5 animate-spin" />
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
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Record Again</span>
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Send className="w-5 h-5" />
            <span>Analyze Recording</span>
          </button>
        </div>
      )}
    </div>
  );
}
