import { useState, useRef, useCallback } from "react";

/**
 * Bulletproof speech recognition hook.
 *
 * The duplicate-word bug happens when you do:
 *   setText(prev + finalText + interimText)
 * because as the recognition engine emits new results, it re-emits
 * previously confirmed words as part of the interim stream.
 *
 * Correct approach:
 * - Keep a `finalText` ref that ONLY grows when results[i].isFinal === true
 * - Show `finalText + currentInterim` in the UI — where currentInterim is
 *   ONLY the latest single interim chunk, never accumulated
 * - On stop, the displayed text = finalText (interim is discarded)
 */
export function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [displayText, setDisplayText] = useState(""); // what user sees live
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(90);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const finalTextRef = useRef(""); // accumulates ONLY final segments
  const onStopCallbackRef = useRef(null);

  const start = useCallback(async (onStop) => {
    setError("");
    setDisplayText("");
    finalTextRef.current = "";
    onStopCallbackRef.current = onStop;

    // Check browser support
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice recognition requires Google Chrome. Please open this page in Chrome.");
      return false;
    }

    // Check microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access was denied. Please allow microphone access in your browser and try again.");
      return false;
    }

    const recognition = new SR();
    // KEY SETTINGS:
    recognition.continuous = false;      // single utterance mode — prevents accumulation bug
    recognition.interimResults = true;   // show live feedback
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setTimeLeft(90);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    recognition.onresult = (event) => {
      let newFinal = "";
      let interim = "";

      // Only process NEW results from resultIndex onwards
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript + " ";
        } else {
          interim = transcript; // only keep latest interim, never accumulate
        }
      }

      if (newFinal) {
        finalTextRef.current += newFinal;
      }

      // Display = confirmed finals + current interim preview
      setDisplayText(finalTextRef.current + (interim ? interim : ""));
    };

    recognition.onspeechend = () => {
      // Speech paused — in non-continuous mode this triggers onend
      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearInterval(timerRef.current);
      const result = finalTextRef.current.trim();
      setDisplayText(result); // clean final display
      if (onStopCallbackRef.current) {
        onStopCallbackRef.current(result);
        onStopCallbackRef.current = null;
      }
    };

    recognition.onerror = (event) => {
      clearInterval(timerRef.current);
      setIsRecording(false);
      if (event.error === "no-speech") {
        // silent — user just didn't speak, not an error
        const result = finalTextRef.current.trim();
        setDisplayText(result);
        if (onStopCallbackRef.current) {
          onStopCallbackRef.current(result);
          onStopCallbackRef.current = null;
        }
      } else if (event.error === "aborted") {
        // intentional stop, ignore
      } else {
        setError(`Microphone error: ${event.error}. Please check your microphone and try again.`);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      return true;
    } catch (e) {
      setError("Could not start recording. Please refresh and try again.");
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  const reset = useCallback(() => {
    finalTextRef.current = "";
    setDisplayText("");
    setError("");
    setTimeLeft(90);
  }, []);

  return { isRecording, displayText, error, timeLeft, start, stop, reset, setError };
}
