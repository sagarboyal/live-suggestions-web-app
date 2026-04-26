import React, { useEffect, useRef } from 'react';
import './MicButton.css';

interface MicButtonProps {
  isRecording: boolean;
  stream: MediaStream | null;
  onToggle: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ isRecording, stream, onToggle }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording && stream) {
      if (!audioContextRef.current) {
        // Initialize Web Audio API for amplitude analysis
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }

      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;
      
      // Resume context if suspended (browser behavior)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!analyserRef.current) {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
      }

      const analyser = analyserRef.current;
      
      let source: MediaStreamAudioSourceNode | null = null;
      try {
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (err) {
        console.error("Failed to connect audio source:", err);
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current || !btnRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Normalize volume to roughly 0 - 1 (average maxes out around 100-128)
        const volumeLabel = Math.min(average / 100, 1);

        // Update CSS variable directly to avoid expensive React re-renders
        btnRef.current.style.setProperty('--mic-volume', volumeLabel.toString());
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (source) {
          source.disconnect();
        }
      };
    } else {
      // Cleanup when stopped
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (btnRef.current) {
        btnRef.current.style.setProperty('--mic-volume', '0');
      }
    }
  }, [isRecording, stream]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  return (
    <button
      ref={btnRef}
      className={`btn-mic ${isRecording ? 'recording' : ''}`}
      onClick={onToggle}
      aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
    >
      <div className="mic-rings"></div>
      <div className="inner-circle"></div>
    </button>
  );
};

export default MicButton;
