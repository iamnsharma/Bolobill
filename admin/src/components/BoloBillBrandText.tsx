type Props = {
  className?: string;
};

/** Text-only “Bolo Bill” — use where a full logo image is not needed. */
export default function BoloBillBrandText({ className = "" }: Props) {
  return (
    <span className={`bolobill-brand-text${className ? ` ${className}` : ""}`}>
      Bolo<span className="bolobill-brand-text__accent">Bill</span>
    </span>
  );
}
