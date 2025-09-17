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

    // Always use fallback speech synthesis for now
    fallbackToSpeechSynthesis(cleanText, langCode);
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
