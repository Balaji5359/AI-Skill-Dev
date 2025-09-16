import { SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { polly } from './aws-config';

let currentAudio = null;

// Map languages to Polly voices
const voiceMap = {
    "en-US": { voiceId: "Joanna", engine: "neural" }, // English
    "hi-IN": { voiceId: "Aditi", engine: "neural" },  // Hindi
    "te-IN": { voiceId: "Neeraja", engine: "neural" }, // Telugu
    "kn-IN": { voiceId: "Aditi", engine: "neural" }   // Kannada (using Aditi as fallback)
};

export const speakWithPolly = async (text, langCode = "en-US") => {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    if (!text) return;

    // Clean text for better speech synthesis
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();
    if (!cleanText) return;

    try {
        const { voiceId, engine } = voiceMap[langCode] || voiceMap["en-US"];

        const command = new SynthesizeSpeechCommand({
            OutputFormat: "mp3",
            Text: cleanText,
            VoiceId: voiceId,
            Engine: engine,
            LanguageCode: langCode
        });

        const data = await polly.send(command);

        if (data && data.AudioStream) {
            const audioBytes = await data.AudioStream.transformToByteArray();
            const blob = new Blob([audioBytes], { type: "audio/mp3" });
            const audioUrl = URL.createObjectURL(blob);
            currentAudio = new Audio(audioUrl);

            await currentAudio.play();

            currentAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
            };
        }
    } catch (error) {
        console.error("Polly synthesis error:", error);
        fallbackToSpeechSynthesis(cleanText, langCode);
    }
};

export const stopSpeech = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
};

// Fallback using browser’s built-in speech synthesis
const fallbackToSpeechSynthesis = (text, langCode = "en-US") => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
    } else {
        console.warn("Speech synthesis not supported");
    }
};

export default speakWithPolly;
