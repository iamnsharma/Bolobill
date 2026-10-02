type FilterApplyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function FilterApplyButton({
  loading,
  className = "",
  type = "submit",
  children,
  ...rest
}: FilterApplyButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-primary d-inline-flex align-items-center gap-1 ${className}`.trim()}
      disabled={loading || rest.disabled}
      {...rest}
    >
      <i className="ti ti-check" aria-hidden />
      {children ?? "Apply"}
    </button>
  );
}
