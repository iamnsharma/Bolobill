import { useEffect, useRef, useState } from "react";
import { adminApi, type AddressBookContact } from "../api/admin";
import AppModal from "../components/AppModal";
import ConfirmModal from "../components/ConfirmModal";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";

export default function AddressBook() {
  const [contacts, setContacts] = useState<AddressBookContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchContacts = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listAddressBookContacts({
        q: q.trim() || undefined,
        limit: 100,
      });
      setContacts(res.contacts);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Failed to load contacts",
      );
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts("");
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchContacts(search), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [search]);

  const openAdd = () => {
    setFormName("");
    setFormPhone("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    setSubmitLoading(true);
    try {
      await adminApi.saveAddressBookContact({
        name: formName.trim(),
        phone: formPhone.trim(),
      });
      setShowForm(false);
      fetchContacts(search);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Could not save contact",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteAddressBookContact(deleteId);
      setDeleteId(null);
      fetchContacts(search);
    } catch {
      setError("Could not delete contact");
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Address book"
        subtitle="Customer phone numbers for quick WhatsApp billing"
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
            <i className="ti ti-user-plus me-1" aria-hidden />
            Add contact
          </button>
        }
      />

      <SectionPanel title="Contacts" icon="ti-address-book">
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="ti ti-search" aria-hidden />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Search by name or phone number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error ? <div className="alert alert-danger small py-2">{error}</div> : null}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <MerchantDataTable>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <MerchantTableHeadLabel>Name</MerchantTableHeadLabel>
                  <MerchantTableHeadLabel>Phone</MerchantTableHeadLabel>
                  <th className="text-end small text-muted text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      No contacts found. Add one or save customers when sharing a bill.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td>{c.phone}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteId(c.id)}
                          aria-label={`Delete ${c.name}`}>
                          <i className="ti ti-trash" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </MerchantDataTable>
        )}
      </SectionPanel>

      <AppModal
        show={showForm}
        title="Add contact"
        onClose={() => setShowForm(false)}
        size="md"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              type="submit"
              form="address-book-form"
              className="btn btn-primary"
              disabled={submitLoading}>
              {submitLoading ? <span className="spinner-border spinner-border-sm" /> : "Save"}
            </button>
          </>
        }>
        <form id="address-book-form" onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Name</label>
            <input
              className="form-control"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-0">
            <label className="form-label small fw-semibold">Phone</label>
            <input
              type="tel"
              className="form-control"
              placeholder="10-digit mobile"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
              required
            />
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        show={!!deleteId}
        title="Delete contact?"
        message="This customer will be removed from your address book."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </PageShell>
  );
}
