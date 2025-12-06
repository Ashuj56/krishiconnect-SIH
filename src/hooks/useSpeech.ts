import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechOptions {
  language?: string;
  onTranscript?: (text: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onListeningChange?: (listening: boolean) => void;
  continuous?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

export function useSpeech(options: UseSpeechOptions = {}) {
  const { 
    language = 'en-IN', 
    onTranscript, 
    onSpeakingChange,
    onListeningChange,
    continuous = false 
  } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognitionType>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const continuousRef = useRef(continuous);
  const shouldRestartRef = useRef(false);

  // Update continuous ref when prop changes
  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  // Cleanup audio analysis
  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Start audio analysis for visual feedback
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(average / 128, 1));
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuousRef.current;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      onListeningChange?.(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setInterimTranscript(interimText);
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
        setInterimTranscript('');
        if (onTranscript) {
          onTranscript(finalTranscript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // Don't stop for no-speech errors in continuous mode
      if (event.error === 'no-speech' && continuousRef.current && shouldRestartRef.current) {
        return;
      }
      setIsListening(false);
      onListeningChange?.(false);
      cleanupAudioAnalysis();
    };

    recognition.onend = () => {
      // Auto-restart in continuous mode if we should still be listening
      if (continuousRef.current && shouldRestartRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          setIsListening(false);
          onListeningChange?.(false);
          cleanupAudioAnalysis();
        }
      } else {
        setIsListening(false);
        onListeningChange?.(false);
        cleanupAudioAnalysis();
      }
    };

    return recognition;
  }, [language, onTranscript, onListeningChange, cleanupAudioAnalysis]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onSpeakingChange?.(false);
    
    shouldRestartRef.current = true;
    recognitionRef.current = initRecognition();
    
    if (recognitionRef.current) {
      setTranscript('');
      setInterimTranscript('');
      try {
        await startAudioAnalysis();
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        cleanupAudioAnalysis();
      }
    }
  }, [isSupported, initRecognition, startAudioAnalysis, cleanupAudioAnalysis, onSpeakingChange]);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    onListeningChange?.(false);
    cleanupAudioAnalysis();
  }, [cleanupAudioAnalysis, onListeningChange]);

  // Speak text with enhanced voice selection
  const speak = useCallback((text: string, lang?: string) => {
    if (!isSupported || !text) return;

    // Stop listening while speaking to prevent feedback
    if (isListening) {
      shouldRestartRef.current = continuousRef.current;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang || language;
    utterance.lang = targetLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Find best matching voice
    const voices = window.speechSynthesis.getVoices();
    
    // Priority: exact language match > regional match > any Indian voice > default
    let matchingVoice = voices.find(v => v.lang === targetLang);
    if (!matchingVoice) {
      matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    }
    if (!matchingVoice) {
      matchingVoice = voices.find(v => v.lang.includes('IN'));
    }
    if (!matchingVoice && voices.length > 0) {
      matchingVoice = voices[0];
    }
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
      
      // Resume listening in continuous mode after speaking
      if (continuousRef.current && shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current) {
            startListening();
          }
        }, 300);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, language, isListening, onSpeakingChange, startListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onSpeakingChange?.(false);
  }, [onSpeakingChange]);

  // Toggle conversation mode (continuous listening)
  const toggleConversationMode = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
      cleanupAudioAnalysis();
    };
  }, [cleanupAudioAnalysis]);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    isSupported,
    audioLevel,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleConversationMode,
  };
}
