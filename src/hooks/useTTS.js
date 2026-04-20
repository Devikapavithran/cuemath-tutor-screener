import { useRef, useState, useCallback } from "react";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const resolveRef = useRef(null);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!synthRef.current) { resolve(); return; }
      synthRef.current.cancel();

      // Small delay so cancel() clears properly
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.88;
        utt.pitch = 1.05;
        utt.volume = 1;

        // Pick the best available voice
        const voices = synthRef.current.getVoices();
        const preferred =
          voices.find(v => v.name === "Google UK English Female") ||
          voices.find(v => v.name === "Google US English") ||
          voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
          voices.find(v => v.lang === "en-US" && !v.name.includes("Microsoft")) ||
          voices.find(v => v.lang.startsWith("en"));
        if (preferred) utt.voice = preferred;

        utt.onstart = () => setIsSpeaking(true);
        utt.onend = () => { setIsSpeaking(false); resolve(); };
        utt.onerror = () => { setIsSpeaking(false); resolve(); };

        resolveRef.current = resolve;
        synthRef.current.speak(utt);
      }, 80);
    });
  }, []);

  const cancel = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
    if (resolveRef.current) { resolveRef.current(); resolveRef.current = null; }
  }, []);

  return { isSpeaking, speak, cancel };
}
