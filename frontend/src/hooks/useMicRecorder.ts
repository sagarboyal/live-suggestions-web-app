import { useState, useRef } from 'react';

export const useMicRecorder = (onChunkReady: (blob: Blob, startTime: number) => void) => {
  const SILENCE_THRESHOLD = 0.035;
  const MIN_SPEECH_FRAMES = 8;

  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkStartTimeRef = useRef<number>(0);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sampleBufferRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);
  const chunkHasSpeechRef = useRef(false);
  const speechFrameCountRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;
      
      // Clone the stream so the UI audio visualizer doesn't consume the same exact stream reference
      setStream(stream.clone());
      
      let intervalMs = 5000;
      if (process.env.REACT_APP_CHUNK_INTERVAL_MS) {
        const parsed = parseInt(process.env.REACT_APP_CHUNK_INTERVAL_MS, 10);
        if (!isNaN(parsed) && parsed > 0) {
          intervalMs = parsed;
        }
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        const sourceNode = audioContext.createMediaStreamSource(streamRef.current);
        sourceNode.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceNodeRef.current = sourceNode;
        sampleBufferRef.current = new Uint8Array(analyser.fftSize);

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }

      const monitorAudioLevel = () => {
        const analyser = analyserRef.current;
        const buffer = sampleBufferRef.current;
        if (!analyser || !buffer) {
          return;
        }

        analyser.getByteTimeDomainData(buffer);

        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const normalized = (buffer[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }

        const rms = Math.sqrt(sumSquares / buffer.length);
        if (rms >= SILENCE_THRESHOLD) {
          speechFrameCountRef.current += 1;
          if (speechFrameCountRef.current >= MIN_SPEECH_FRAMES) {
            chunkHasSpeechRef.current = true;
          }
        }

        animationFrameRef.current = window.requestAnimationFrame(monitorAudioLevel);
      };
      
      const startNewChunk = () => {
        if (!streamRef.current) return;
        
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        
        recorder.onstart = () => {
          chunkStartTimeRef.current = Date.now();
          chunkHasSpeechRef.current = false;
          speechFrameCountRef.current = 0;
        };

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && chunkHasSpeechRef.current) {
            onChunkReady(e.data, chunkStartTimeRef.current);
          }
        };

        recorder.onstop = () => {
          if (isRecordingRef.current && streamRef.current) {
            startNewChunk();
          }
        };

        recorder.start();
      };

      // Initial start
      isRecordingRef.current = true;
      setIsRecording(true);
      setError(null);
      monitorAudioLevel();
      startNewChunk();

      // Setup interval to stop current recorder and start a new one
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, intervalMs);

      console.log('MediaRecorder looping with interval:', intervalMs);
    } catch (err: any) {
      setError(err.message || 'Error accessing microphone');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => null);
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    sampleBufferRef.current = null;
    chunkHasSpeechRef.current = false;
    speechFrameCountRef.current = 0;
    setStream(null);
    setIsRecording(false);
  };

  return { isRecording, startRecording, stopRecording, error, stream };
};
