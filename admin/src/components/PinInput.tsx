import { useState, type ChangeEvent } from "react";

type PinInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  /** Marketing login card vs dashboard form-control */
  variant?: "marketing" | "form";
  className?: string;
  disabled?: boolean;
};

export default function PinInput({
  id,
  value,
  onChange,
  placeholder = "PIN",
  autoComplete = "current-password",
  maxLength = 8,
  variant = "marketing",
  className = "",
  disabled = false,
}: PinInputProps) {
  const [visible, setVisible] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const toggleLabel = visible ? "Hide PIN" : "Show PIN";

  if (variant === "form") {
    return (
      <div className={`pin-input-form-wrap ${className}`.trim()}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          autoComplete={autoComplete}
          maxLength={maxLength}
          disabled={disabled}
          inputMode="numeric"
        />
        <button
          type="button"
          className="pin-input-form-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={toggleLabel}
          title={toggleLabel}
          disabled={disabled}
        >
          <i className={`ti ${visible ? "ti-eye-off" : "ti-eye"}`} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className={`marketing-input-wrap marketing-input-wrap--pin ${className}`.trim()}>
      <span className="marketing-input-icon" aria-hidden>
        <i className="ti ti-lock" />
      </span>
      <input
        id={id}
        type={visible ? "text" : "password"}
        className="form-control marketing-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
        inputMode="numeric"
      />
      <button
        type="button"
        className="marketing-input-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={toggleLabel}
        title={toggleLabel}
        disabled={disabled}
      >
        <i className={`ti ${visible ? "ti-eye-off" : "ti-eye"}`} aria-hidden />
      </button>
    </div>
  );
}
