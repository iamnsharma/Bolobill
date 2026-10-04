import { BOLOBILL_APP_ICON_URL } from "../config/brand";

type Props = {
  /** Full horizontal lockup vs cropped mark (icon portion only). */
  variant?: "lockup" | "icon";
  className?: string;
  alt?: string;
};

export default function BoloBillLogo({
  variant = "lockup",
  className = "",
  alt = "Bolo Bill",
}: Props) {
  return (
    <img
      src={BOLOBILL_APP_ICON_URL}
      alt={alt}
      className={`bolobill-logo bolobill-logo--${variant}${className ? ` ${className}` : ""}`}
      decoding="async"
    />
  );
}
