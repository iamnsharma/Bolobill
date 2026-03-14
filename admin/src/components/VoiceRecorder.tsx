import { useCallback, useEffect, useRef, useState } from 'react';

export type RecordingResult = { blob: Blob; durationSec: number; mimeType: string };

type Status = 'idle' | 'recording' | 'paused';

type Props = {
  onRecorded: (result: RecordingResult) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({ onRecorded, onError, disabled = false }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedSecRef = useRef<number>(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopTimer, stopStream]);

  const startRecording = useCallback(async () => {
    if (status !== 'idle') return;
    if (disabled) {
      onError?.('Please enter customer name first.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopStream();
        stopTimer();
        const durationSec = elapsedSecRef.current;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType });
        if (blob.size > 0) {
          onRecorded({ blob, durationSec: Math.max(1, durationSec), mimeType: blob.type });
        }
        setStatus('idle');
        setElapsedSec(0);
        elapsedSecRef.current = 0;
      };

      recorder.start(1000);
      setStatus('recording');
      setElapsedSec(0);
      elapsedSecRef.current = 0;
      timerRef.current = setInterval(() => {
        setElapsedSec((s) => {
          const next = s + 1;
          elapsedSecRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err) {
      onError?.('Microphone access denied or unavailable.');
    }
  }, [status, disabled, onRecorded, onError, stopStream, stopTimer]);

  const pauseOrResume = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    try {
      if (status === 'recording') {
        if (rec.state === 'recording' && typeof rec.pause === 'function') {
          rec.pause();
          stopTimer();
          setStatus('paused');
        }
      } else if (status === 'paused') {
        if (rec.state === 'paused' && typeof rec.resume === 'function') {
          rec.resume();
          setStatus('recording');
          timerRef.current = setInterval(() => {
            setElapsedSec((s) => {
              const next = s + 1;
              elapsedSecRef.current = next;
              return next;
            });
          }, 1000);
        }
      }
    } catch {
      onError?.('Pause/Resume not supported in this browser. Use Stop when done.');
    }
  }, [status, stopTimer, onError]);

  const stopRecording = useCallback(() => {
    if (status === 'idle') return;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }
    mediaRecorderRef.current = null;
  }, [status]);

  const statusText =
    status === 'recording'
      ? `Recording ${formatTime(elapsedSec)}`
      : status === 'paused'
        ? `Paused at ${formatTime(elapsedSec)}`
        : 'Tap the mic or Record to start. Use Pause/Resume or Stop when done.';

  const isRecording = status === 'recording';
  const canStartFromMic = status === 'idle';

  const handleMicClick = () => {
    if (canStartFromMic) startRecording();
  };

  return (
    <div className="voice-recorder border rounded-3 p-4 bg-light bg-opacity-50 position-relative">
      <div className="d-flex flex-column align-items-center gap-3">
        <div
          role="button"
          tabIndex={0}
          aria-label={canStartFromMic ? 'Start recording' : undefined}
          className={`voice-recorder-mic rounded-circle d-flex align-items-center justify-content-center ${
            status === 'recording' ? 'recording' : status === 'paused' ? 'bg-warning' : 'bg-primary'
          } ${canStartFromMic ? 'voice-recorder-mic--clickable' : ''}`}
          style={{ width: 88, height: 88 }}
          onClick={handleMicClick}
          onKeyDown={(e) => { if (canStartFromMic && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startRecording(); } }}
        >
          {isRecording ? (
            <img src="/gifs/recording.gif" alt="Recording" className="voice-recorder-gif" />
          ) : status === 'paused' ? (
            <i className="ti ti-player-pause" style={{ fontSize: '2rem', color: 'white' }} />
          ) : (
            <i className="ti ti-microphone" style={{ fontSize: '2rem', color: 'white' }} />
          )}
        </div>
        <p className="mb-0 small text-muted text-center">{statusText}</p>
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={startRecording}
            disabled={status !== 'idle'}
          >
            <i className="ti ti-circle-plus me-1" />
            Record
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={pauseOrResume}
            disabled={status === 'idle'}
          >
            <i className={`ti ${status === 'paused' ? 'ti-player-play' : 'ti-player-pause'} me-1`} />
            {status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={stopRecording}
            disabled={status === 'idle'}
          >
            <i className="ti ti-square me-1" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
