import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const blob = new Blob([audioFile], { type: audioFile.type });
    const formData = new FormData();
    formData.append("file", blob, audioFile.name);
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("response_format", "json");
    formData.append("language", "en");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || "Transcription failed");
    }

    const data = await response.json();
    return data.text; // Return raw text without formatting
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}
