import { useCallback, useEffect, useRef, useState } from "react";
import {
  notifyVoiceComingSoon,
  VOICE_MIC_FEATURE_ENABLED,
} from "../utils/voiceComingSoon";

export type RecordingResult = { blob: Blob; durationSec: number; mimeType: string };

type Status = "idle" | "recording" | "paused";

type Props = {
  onRecorded: (result: RecordingResult) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  /** ChatGPT-style: mic circle only, no Record/Pause labels */
  minimal?: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({
  onRecorded,
  onError,
  disabled = false,
  minimal = true,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopTimer, stopStream]);

  const startRecording = useCallback(async () => {
    if (status !== "idle") return;
    if (!VOICE_MIC_FEATURE_ENABLED) {
      notifyVoiceComingSoon(onError);
      return;
    }
    if (disabled) {
      onError?.("Please complete required fields first.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
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
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType,
        });
        if (blob.size > 0) {
          onRecorded({
            blob,
            durationSec: Math.max(1, durationSec),
            mimeType: blob.type,
          });
        }
        setStatus("idle");
        setElapsedSec(0);
        elapsedSecRef.current = 0;
      };

      recorder.start(200);
      setStatus("recording");
      elapsedSecRef.current = 0;
      setElapsedSec(0);
      timerRef.current = setInterval(() => {
        elapsedSecRef.current += 1;
        setElapsedSec(elapsedSecRef.current);
      }, 1000);
    } catch {
      onError?.("Microphone access denied or unavailable.");
    }
  }, [disabled, onError, onRecorded, status, stopStream, stopTimer]);

  const pauseOrResume = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (status === "recording") {
      rec.pause();
      stopTimer();
      setStatus("paused");
    } else if (status === "paused") {
      rec.resume();
      timerRef.current = setInterval(() => {
        elapsedSecRef.current += 1;
        setElapsedSec(elapsedSecRef.current);
      }, 1000);
      setStatus("recording");
    }
  }, [status, stopTimer]);

  const stopRecording = useCallback(() => {
    if (status === "idle") return;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    }
    mediaRecorderRef.current = null;
  }, [status]);

  const isRecording = status === "recording";
  const canStartFromMic = status === "idle";

  const micSize = minimal ? 56 : 88;

  const micButton = (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        canStartFromMic
          ? "Start recording"
          : status === "recording"
            ? "Recording"
            : "Paused"
      }
      className={`voice-recorder-mic rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
        status === "recording"
          ? "recording"
          : status === "paused"
            ? "bg-warning"
            : "bg-dark"
      } ${canStartFromMic ? "voice-recorder-mic--clickable" : ""} ${disabled ? "opacity-50" : ""}`}
      style={{ width: micSize, height: micSize }}
      onClick={() => {
        if (canStartFromMic) startRecording();
      }}
      onKeyDown={(e) => {
        if (canStartFromMic && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          startRecording();
        }
      }}
    >
      {isRecording ? (
        <span className="voice-recorder-pulse" aria-hidden />
      ) : status === "paused" ? (
        <i className="ti ti-player-pause text-white" style={{ fontSize: "1.35rem" }} />
      ) : (
        <i className="ti ti-microphone text-white" style={{ fontSize: "1.35rem" }} />
      )}
    </div>
  );

  if (minimal) {
    return (
      <div className="voice-recorder-minimal d-flex align-items-center gap-3">
        {micButton}
        <div className="flex-grow-1 min-width-0">
          {status === "idle" && (
            <span className="small text-muted">
              {VOICE_MIC_FEATURE_ENABLED ? "Tap mic to speak" : "Voice billing — coming soon"}
            </span>
          )}
          {status !== "idle" && (
            <span className="small fw-medium">{formatTime(elapsedSec)}</span>
          )}
        </div>
        {status !== "idle" && (
          <div className="d-flex gap-1">
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-2"
              onClick={pauseOrResume}
              aria-label={status === "paused" ? "Resume" : "Pause"}
            >
              <i className={`ti ${status === "paused" ? "ti-player-play" : "ti-player-pause"}`} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-dark rounded-circle p-2"
              onClick={stopRecording}
              aria-label="Stop and use recording"
            >
              <i className="ti ti-square" />
            </button>
          </div>
        )}
      </div>
    );
  }

  const statusText =
    status === "recording"
      ? `Recording ${formatTime(elapsedSec)}`
      : status === "paused"
        ? `Paused at ${formatTime(elapsedSec)}`
        : VOICE_MIC_FEATURE_ENABLED
          ? "Tap the mic or Record to start. Use Pause/Resume or Stop when done."
          : "Voice billing — coming soon.";

  return (
    <div className="voice-recorder border rounded-3 p-4 bg-light bg-opacity-50 position-relative">
      <div className="d-flex flex-column align-items-center gap-3">
        {micButton}
        <p className="mb-0 small text-muted text-center">{statusText}</p>
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={startRecording}
            disabled={status !== "idle"}
          >
            <i className="ti ti-circle-plus me-1" />
            Record
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={pauseOrResume}
            disabled={status === "idle"}
          >
            <i
              className={`ti ${status === "paused" ? "ti-player-play" : "ti-player-pause"} me-1`}
            />
            {status === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={stopRecording}
            disabled={status === "idle"}
          >
            <i className="ti ti-square me-1" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}

/** Icon-only trigger for voice flows (shows coming soon until voice is enabled). */
export function MicIconButton({
  onClick,
  active = false,
  disabled = false,
  title = "Speak",
  className = "",
}: {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`btn btn-light border rounded-circle p-2 d-inline-flex align-items-center justify-content-center ${active ? "border-dark" : ""} ${className}`}
      onClick={() => {
        if (!VOICE_MIC_FEATURE_ENABLED) {
          notifyVoiceComingSoon();
          return;
        }
        onClick?.();
      }}
      disabled={disabled}
      title={VOICE_MIC_FEATURE_ENABLED ? title : "Coming soon — voice billing"}
      aria-label={VOICE_MIC_FEATURE_ENABLED ? title : "Voice billing coming soon"}
      style={{ width: 44, height: 44 }}
    >
      <i className="ti ti-microphone fs-5" />
    </button>
  );
}
