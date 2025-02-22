import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY2,
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

export async function analyzeTranscription(transcription: string): Promise<string> {
  try {
    const chat_completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing potential scam calls. Analyze the given transcription and explain in detail why it might be a scam or legitimate call. Focus on identifying red flags, manipulation tactics, or genuine business practices.",
        },
        {
          role: "user",
          content: `Analyze this call transcription and explain why it might be a scam or not: "${transcription}"`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0,
      stream: false,
    });

    return chat_completion.choices[0].message.content;
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
}
