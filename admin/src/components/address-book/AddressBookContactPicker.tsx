import { useEffect, useRef, useState } from "react";
import { adminApi, type AddressBookContact } from "../../api/admin";

type AddressBookContactPickerProps = {
  selectedId: string | null;
  onSelect: (contact: AddressBookContact) => void;
  className?: string;
};

export default function AddressBookContactPicker({
  selectedId,
  onSelect,
  className = "",
}: AddressBookContactPickerProps) {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<AddressBookContact[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (q: string) => {
    setLoading(true);
    adminApi
      .listAddressBookContacts({ q: q.trim() || undefined, limit: 50 })
      .then((res) => setContacts(res.contacts))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load("");
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(query), 280);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  return (
    <div className={`address-book-picker ${className}`.trim()}>
      <label className="form-label fw-semibold small mb-1">Choose from contacts</label>
      <div className="input-group input-group-sm mb-2">
        <span className="input-group-text bg-white">
          <i className="ti ti-search" aria-hidden />
        </span>
        <input
          type="search"
          className="form-control"
          placeholder="Search name or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="address-book-picker-list border rounded-3 bg-white">
        {loading ? (
          <p className="small text-muted text-center py-4 mb-0">
            <span className="spinner-border spinner-border-sm me-1" role="status" />
            Loading…
          </p>
        ) : contacts.length === 0 ? (
          <p className="small text-muted text-center py-4 mb-0 px-2">
            No contacts yet. Save customers when sharing bills, or add them in Address Book.
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {contacts.map((c) => (
              <li key={c.id} className="list-group-item p-0">
                <button
                  type="button"
                  className={`address-book-picker-item w-100 text-start border-0 bg-transparent px-3 py-2${
                    selectedId === c.id ? " address-book-picker-item--active" : ""
                  }`}
                  onClick={() => onSelect(c)}>
                  <span className="d-block fw-semibold small text-truncate">{c.name}</span>
                  <span className="d-block text-muted" style={{ fontSize: "0.8rem" }}>
                    {c.phone}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
