import { useEffect, useId, useRef, useState } from "react";

export default function ExpandableSearch({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value.trim()) setOpen(true);
  }, [value]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 180);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node) && !value.trim()) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [value]);

  return (
    <div
      ref={rootRef}
      className={`expandable-search ${open ? "is-open" : ""} ${className}`}
    >
      <button
        type="button"
        className="expandable-search-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={inputId}
        title="Search"
      >
        <i className="ti ti-search" aria-hidden />
      </button>
      <div className="expandable-search-field">
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          className="form-control form-control-sm expandable-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              if (value) onChange("");
              else setOpen(false);
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="expandable-search-clear"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <i className="ti ti-x" />
          </button>
        )}
      </div>
    </div>
  );
}
