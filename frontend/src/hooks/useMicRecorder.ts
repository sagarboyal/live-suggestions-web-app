import { useState, useRef } from 'react';

export const useMicRecorder = (onChunkReady: (blob: Blob, startTime: number) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkStartTimeRef = useRef<number>(0);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      
      const startNewChunk = () => {
        if (!streamRef.current) return;
        
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        
        recorder.onstart = () => {
          chunkStartTimeRef.current = Date.now();
        };

        recorder.ondataavailable = (e) => {
          // Send the chunk if it has data
          if (e.data.size > 0) {
            onChunkReady(e.data, chunkStartTimeRef.current);
          }
        };

        recorder.start();
      };

      // Initial start
      setIsRecording(true);
      setError(null);
      startNewChunk();

      // Setup interval to stop current recorder and start a new one
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop(); // This triggers ondataavailable
          startNewChunk(); // Immediately start next chunk
        }
      }, intervalMs);

      console.log('MediaRecorder looping with interval:', intervalMs);
    } catch (err: any) {
      setError(err.message || 'Error accessing microphone');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
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
    setStream(null);
    setIsRecording(false);
  };

  return { isRecording, startRecording, stopRecording, error, stream };
};
