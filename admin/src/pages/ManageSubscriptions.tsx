import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price?: number;
  invoicesLimit: number;
  voiceMinutesLimit: number;
  icon: string;
}

const mapFromApi = (p: any): SubscriptionPlan => ({
  id: p._id,
  name: p.name,
  description: p.features?.[0] || '',
  price: p.price,
  invoicesLimit: p.invoiceLimit,
  voiceMinutesLimit: p.voiceMinutesLimit,
  icon: p.icon === 'ti-star' ? '' : p.icon,
});

const mapToApi = (p: SubscriptionPlan) => ({
  name: p.name,
  features: p.description ? [p.description] : [],
  price: p.price || 0,
  invoiceLimit: p.invoicesLimit || 0,
  voiceMinutesLimit: p.voiceMinutesLimit || 0,
  icon: p.icon || 'ti-star',
});

const EXPIRY_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '3', label: '3 days' },
  { value: '1', label: '1 day' },
  { value: '0', label: 'Today' },
] as const;

export default function ManageSubscriptions() {
  const { isSuperAdmin } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [notifyExpiryDays, setNotifyExpiryDays] = useState<string>('7');
  const [notifySent, setNotifySent] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/plans/admin');
      setPlans(res.data.plans.map(mapFromApi));
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPlans();
    }
  }, [isSuperAdmin, fetchPlans]);

  const updatePlan = useCallback((id: string, patch: Partial<SubscriptionPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const handleSave = async (plan: SubscriptionPlan) => {
    setSavingId(plan.id);
    try {
      let res;
      if (plan.id.startsWith('new_')) {
        res = await api.post('/plans', mapToApi(plan));
      } else {
        res = await api.put(`/plans/${plan.id}`, mapToApi(plan));
      }
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? mapFromApi(res.data.plan) : p)));
      setEditingPlanId(null);
    } catch (e) {
      console.error('Failed to save plan', e);
      alert('Failed to save plan, see console for details.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
  };

  const handleIconChange = (planId: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePlan(planId, { icon: reader.result as string });
    reader.readAsDataURL(file);
  };

  const addNewMembership = () => {
    const id = `new_${Date.now()}`;
    const newPlan: SubscriptionPlan = {
      id,
      name: 'New plan ' + Math.floor(Math.random() * 100),
      description: '',
      price: 0,
      invoicesLimit: 0,
      voiceMinutesLimit: 0,
      icon: '',
    };
    setPlans([...plans, newPlan]);
    setEditingPlanId(id);
  };

  const removePlan = async (id: string) => {
    try {
      if (!id.startsWith('new_')) {
        await api.delete(`/plans/${id}`);
      }
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      if (editingPlanId === id) setEditingPlanId(null);
    } catch (e) {
      console.error('Failed to delete plan', e);
      alert('Failed to delete plan');
    }
  };

  const handleNotifyExpiring = () => {
    setNotifySent(true);
    setTimeout(() => setNotifySent(false), 3000);
  };

  if (!isSuperAdmin) {
    return (
      <div className="mt-6 admin-page">
        <div className="alert alert-warning">Only super admins can manage subscriptions.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-6 admin-page d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 admin-page manage-subscriptions-page">
      <div className="manage-subscriptions-hero rounded-4 overflow-hidden mb-4">
        <div className="manage-subscriptions-hero-inner">
          <span className="manage-subscriptions-hero-badge">Super admin</span>
          <h1 className="manage-subscriptions-hero-title">Manage subscriptions</h1>
          <p className="manage-subscriptions-hero-sub mb-0">
            Set invoice and voice limits per plan. Add custom plans, upload icons, and notify users when their subscription is expiring.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 manage-subscriptions-quick-card">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="manage-subscriptions-quick-icon rounded-2 d-flex align-items-center justify-content-center">
                  <i className="ti ti-file-invoice text-primary" />
                </span>
                <span className="fw-bold small">Plans</span>
              </div>
              <p className="h4 mb-0 fw-bold">{plans.length}</p>
              <p className="small text-muted mb-0">Active plans</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 manage-subscriptions-quick-card">
            <div className="card-body p-3">
              <h3 className="h6 fw-bold mb-2">
                <i className="ti ti-bell me-2 text-warning" />
                Notify expiring
              </h3>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  value={notifyExpiryDays}
                  onChange={(e) => setNotifyExpiryDays(e.target.value)}
                >
                  {EXPIRY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={handleNotifyExpiring}
                  disabled={notifySent}
                >
                  {notifySent ? 'Sent' : 'Notify'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 manage-subscriptions-quick-card">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <span className="manage-subscriptions-quick-icon rounded-2 d-flex align-items-center justify-content-center">
                <i className="ti ti-users text-info" />
              </span>
              <div>
                <p className="fw-bold small mb-0">Users &amp; plans</p>
                <p className="small text-muted mb-0">Assign plans per user</p>
                <Link to="/dashboard/users" className="btn btn-outline-primary btn-sm mt-1">Open</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 manage-subscriptions-quick-card manage-subscriptions-quick-card--cta">
            <div className="card-body p-3 d-flex flex-column justify-content-center">
              <p className="small fw-bold mb-1">Add a new plan</p>
              <p className="small text-muted mb-2">Custom limits &amp; icon</p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-3 w-100"
                onClick={addNewMembership}
              >
                <i className="ti ti-plus me-1" />
                New membership
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3">
        <h2 className="h5 fw-bold mb-0">Plan limits &amp; features</h2>
        <span className="badge bg-light text-dark border">{plans.length} plans</span>
      </div>
      <p className="text-muted small mb-4">
        Click <i className="ti ti-pencil ms-1 me-1" /> to edit limits, icon, description and price. Click <i className="ti ti-trash ms-1 me-1" /> to remove a plan.
      </p>

      <div className="row g-4">
        {plans.map((plan) => {
          const isEditing = editingPlanId === plan.id;
          return (
            <div key={plan.id} className="col-md-6 col-lg-4">
              <div className={`card border-0 shadow-sm rounded-4 h-100 manage-subscriptions-plan-card ${isEditing ? 'manage-subscriptions-plan-card--editing' : ''}`}>
                <div className="card-body p-4">
                  {isEditing ? (
                    <>
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="manage-subscriptions-icon-wrap rounded-3 overflow-hidden position-relative">
                            {plan.icon ? (
                              <img src={plan.icon} alt={plan.name} className="manage-subscriptions-icon" />
                            ) : (
                              <div className="manage-subscriptions-icon-placeholder d-flex align-items-center justify-content-center">
                                <i className="ti ti-photo-plus text-muted" />
                              </div>
                            )}
                            <label className="manage-subscriptions-icon-upload position-absolute bottom-0 start-0 end-0 m-0 py-1 text-center small bg-dark bg-opacity-75 text-white rounded-0 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="d-none"
                                onChange={(e) => handleIconChange(plan.id, e.target.files?.[0] ?? null)}
                              />
                              Upload
                            </label>
                          </div>
                          <div className="flex-grow-1">
                            <input
                              type="text"
                              className="form-control form-control-sm fw-bold"
                              value={plan.name}
                              onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                              placeholder="Plan name"
                            />
                            <span className="small text-muted">{plan.id}</span>
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0"
                            onClick={() => setDeleteConfirm(plan.id)}
                            title="Delete plan"
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small mb-1">Description</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={plan.description ?? ''}
                          onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                          placeholder="Short description"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small mb-1">Price (₹/month)</label>
                        <input
                          type="number"
                          min={0}
                          className="form-control form-control-sm"
                          value={plan.price ?? 0}
                          onChange={(e) => updatePlan(plan.id, { price: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label small mb-1">Invoices limit</label>
                          <input
                            type="number"
                            min={0}
                            className="form-control form-control-sm"
                            value={plan.invoicesLimit}
                            onChange={(e) => updatePlan(plan.id, { invoicesLimit: Number(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small mb-1">Voice minutes</label>
                          <input
                            type="number"
                            min={0}
                            className="form-control form-control-sm"
                            value={plan.voiceMinutesLimit}
                            onChange={(e) => updatePlan(plan.id, { voiceMinutesLimit: Number(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-3 flex-grow-1"
                          onClick={() => handleSave(plan)}
                          disabled={savingId === plan.id}
                        >
                          {savingId === plan.id ? 'Saved' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-3"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="manage-subscriptions-icon-wrap rounded-3 overflow-hidden bg-light">
                            {plan.icon ? (
                              <img src={plan.icon} alt={plan.name} className="manage-subscriptions-icon" />
                            ) : (
                              <div className="manage-subscriptions-icon-placeholder d-flex align-items-center justify-content-center">
                                <i className="ti ti-crown text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="h5 fw-bold mb-0 text-dark">{plan.name}</h3>
                            {(plan.price ?? 0) > 0 && (
                              <p className="text-primary fw-semibold mb-0 small">
                                ₹{(plan.price ?? 0).toLocaleString()}
                                <span className="fw-normal text-muted"> / month</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                            onClick={() => setEditingPlanId(plan.id)}
                            title="Edit plan"
                          >
                            <i className="ti ti-pencil" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm p-1 rounded-2"
                            onClick={() => setDeleteConfirm(plan.id)}
                            title="Delete plan"
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </div>
                      {plan.description && (
                        <p className="small text-muted mb-3">{plan.description}</p>
                      )}
                      <ul className="list-unstyled small mb-0 manage-subscriptions-features">
                        <li className="d-flex align-items-center gap-2 mb-2">
                          <i className="ti ti-file-invoice text-success flex-shrink-0" />
                          <span><strong>{plan.invoicesLimit.toLocaleString()}</strong> invoices / month</span>
                        </li>
                        <li className="d-flex align-items-center gap-2 mb-2">
                          <i className="ti ti-microphone text-info flex-shrink-0" />
                          <span><strong>{plan.voiceMinutesLimit.toLocaleString()}</strong> voice minutes</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {deleteConfirm && (() => {
        const plan = plans.find((p) => p.id === deleteConfirm);
        if (!plan) return null;
        return (
          <div className="manage-subscriptions-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
            <div className="manage-subscriptions-modal rounded-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="manage-subscriptions-modal-icon-wrap rounded-3 mx-auto mb-3">
                <i className="ti ti-trash text-danger" />
              </div>
              <h3 className="h5 fw-bold mb-2 text-center">Delete plan?</h3>
              <p className="text-center text-muted small mb-1">
                &quot;{plan.name}&quot; will be removed. Users on this plan may need to be reassigned.
              </p>
              <div className="d-flex gap-2 justify-content-center mt-4">
                <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger rounded-3" onClick={() => removePlan(plan.id)}>
                  Delete plan
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
