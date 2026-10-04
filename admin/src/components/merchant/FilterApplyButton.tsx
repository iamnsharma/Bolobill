import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <button
      type={type}
      className={`btn btn-primary merchant-filter-apply-btn d-inline-flex align-items-center justify-content-center gap-1 ${className}`.trim()}
      disabled={loading || rest.disabled}
      {...rest}
    >
      <i className="ti ti-check" aria-hidden />
      {children ?? t("common.apply")}
    </button>
  );
}
