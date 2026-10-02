import type { StockCategory } from "../../api/admin";

export default function CategoryChipBar({
  categories,
  value,
  onChange,
  className = "",
}: {
  categories: StockCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  className?: string;
}) {
  return (
    <div className={`pos-category-chips d-flex gap-2 flex-nowrap overflow-auto pb-1 ${className}`}>
      <button
        type="button"
        className={`btn btn-sm rounded-pill flex-shrink-0 ${
          value === "" ? "btn-primary" : "btn-outline-secondary"
        }`}
        onClick={() => onChange("")}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c._id}
          type="button"
          className={`btn btn-sm rounded-pill flex-shrink-0 ${
            value === c._id ? "btn-primary" : "btn-outline-secondary"
          }`}
          onClick={() => onChange(c._id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
