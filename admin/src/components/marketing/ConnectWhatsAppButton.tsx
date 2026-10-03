import { CONNECT_OVER_WHATSAPP_LABEL, openBoloBillWhatsApp } from "../../config/contact";

type Props = {
  /** Optional pre-filled chat message. */
  prefillMessage?: string;
  className?: string;
  /** Primary green button vs outline link style */
  variant?: "button" | "link";
};

export default function ConnectWhatsAppButton({
  prefillMessage,
  className = "",
  variant = "button",
}: Props) {
  const handleClick = () => {
    openBoloBillWhatsApp(prefillMessage);
  };

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`btn btn-link text-decoration-none text-dark d-inline-flex align-items-center gap-2 p-0 border-0 bg-transparent ${className}`}
      >
        <i className="ti ti-brand-whatsapp fs-4 text-success" aria-hidden />
        <span>{CONNECT_OVER_WHATSAPP_LABEL}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "btn w-100 btn-success fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
      }
    >
      <i className="ti ti-brand-whatsapp" aria-hidden />
      {CONNECT_OVER_WHATSAPP_LABEL}
    </button>
  );
}
