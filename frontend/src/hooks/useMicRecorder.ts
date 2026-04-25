import { useState, useRef } from 'react';

export const useMicRecorder = (onChunkReady: (blob: Blob, startTime: number) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkStartTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        chunkStartTimeRef.current = Date.now();
        setIsRecording(true);
        setError(null);
      };

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          onChunkReady(e.data, chunkStartTimeRef.current);
          chunkStartTimeRef.current = Date.now(); // reset for next chunk
        }
      };

      recorder.start(5000); // chunk every 5 seconds for faster testing
    } catch (err: any) {
      setError(err.message || 'Error accessing microphone');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
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
