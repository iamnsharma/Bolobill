import { useState } from "react";
import { useMembership, type MembershipPlanId } from "../contexts/MembershipContext";

const PLANS: Array<{
  id: MembershipPlanId;
  name: string;
  price: number;
  billsPerMonth: number;
  description: string;
  features: string[];
  icon: string;
  gradient: string;
  popular?: boolean;
}> = [
  {
    id: "Starter",
    name: "Starter",
    price: 399,
    billsPerMonth: 700,
    description: "Best for small kirana / low usage. ~20–25 bills per day.",
    icon: "/membership/starter.png",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    features: [
      "700 bills per month",
      "Voice & manual billing",
      "PDF invoices & WhatsApp share",
      "Out of stock list",
      "Sales summary",
    ],
  },
  {
    id: "Growth",
    name: "Growth",
    price: 799,
    billsPerMonth: 1600,
    description: "Typical Indian grocery shop. ~50 bills per day.",
    icon: "/membership/growth.png",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    popular: true,
    features: [
      "1,600 bills per month",
      "Everything in Starter",
      "Priority support",
      "Export reports",
      "Items sold analytics",
    ],
  },
  {
    id: "Pro",
    name: "Pro",
    price: 1299,
    billsPerMonth: 2600,
    description: "For busy kirana / medical / wholesale. ~80–90 bills per day.",
    icon: "/membership/pro.png",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    features: [
      "2,600 bills per month",
      "Everything in Growth",
      "Highest priority support",
      "Custom limits (on request)",
      "Best for high-volume shops",
    ],
  },
];

export default function Memberships() {
  const { currentPlan, setCurrentPlan } = useMembership();
  const [manageOpen, setManageOpen] = useState(false);

  const handleSubscribe = (planId: MembershipPlanId) => {
    setCurrentPlan(planId);
    setManageOpen(false);
  };

  const handleCancelMembership = () => {
    setCurrentPlan(null);
    setManageOpen(false);
  };

  return (
    <div className="admin-page membership-page">
      {/* Hero */}
      <div className="membership-hero rounded-4 overflow-hidden mb-5">
        <div className="membership-hero-inner">
          <span className="membership-hero-badge">Plans</span>
          <h1 className="membership-hero-title">Choose your growth plan</h1>
          <p className="membership-hero-sub">
            Bill limits reset on your renewal date each month. Upgrade or change plan anytime.
          </p>
        </div>
      </div>

      {/* My membership – current plan & manage */}
      <div className="card border-0 shadow-sm rounded-4 mb-5 membership-current-card">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="membership-current-icon-wrap rounded-3 d-flex align-items-center justify-content-center">
                {currentPlan ? (
                  <img
                    src={PLANS.find((p) => p.id === currentPlan)?.icon}
                    alt={currentPlan}
                    className="membership-current-icon"
                  />
                ) : (
                  <i className="ti ti-crown fs-2 text-warning" />
                )}
              </div>
              <div>
                <h2 className="h5 fw-bold mb-1">
                  {currentPlan ? `Your plan: ${currentPlan}` : "No active membership"}
                </h2>
                <p className="text-muted small mb-0">
                  {currentPlan
                    ? `You're on ${currentPlan} — ${PLANS.find((p) => p.id === currentPlan)?.billsPerMonth.toLocaleString()} bills/month.`
                    : "Subscribe to a plan below to unlock billing limits and features."}
                </p>
              </div>
            </div>
            {currentPlan && (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-3"
                  onClick={() => setManageOpen(!manageOpen)}
                >
                  <i className="ti ti-settings me-1" />
                  Manage
                </button>
                {manageOpen && (
                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-3 btn-sm"
                    onClick={handleCancelMembership}
                  >
                    Cancel (UI only)
                  </button>
                )}
              </div>
            )}
          </div>
          {currentPlan && (
            <div className="mt-3 pt-3 border-top">
              <p className="small text-muted mb-0">
                <strong>What you get:</strong>{" "}
                {PLANS.find((p) => p.id === currentPlan)?.features.join(" · ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* All plans */}
      <h2 className="h5 fw-bold mb-3">All plans</h2>
      <p className="text-muted small mb-4">
        Compare and choose. You can upgrade or switch plan anytime (UI only; payment integration coming later).
      </p>

      <div className="row g-4 mb-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className="col-md-6 col-lg-4">
              <div
                className={`membership-plan-card card border-0 h-100 overflow-hidden rounded-4 ${isCurrent ? "membership-plan-card--active" : ""} ${plan.popular ? "membership-plan-card--popular" : ""}`}
                style={{ "--plan-gradient": plan.gradient } as React.CSSProperties}
              >
                {plan.popular && (
                  <div className="membership-plan-card-ribbon">Popular</div>
                )}
                <div className="membership-plan-card-gradient" />
                <div className="card-body position-relative p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="membership-plan-icon-wrap rounded-3 overflow-hidden">
                      <img src={plan.icon} alt={plan.name} className="membership-plan-icon" />
                    </div>
                    <div>
                      <h3 className="h4 fw-bold mb-0 text-dark">{plan.name}</h3>
                      <p className="text-primary fw-semibold mb-0">
                        ₹{plan.price.toLocaleString()}
                        <span className="fw-normal text-muted small"> / month</span>
                      </p>
                    </div>
                  </div>
                  <p className="small text-muted mb-3 flex-grow-1">{plan.description}</p>
                  <ul className="list-unstyled small mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="d-flex align-items-center gap-2 mb-2">
                        <i className="ti ti-check text-success flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {isCurrent ? (
                      <div className="d-flex align-items-center gap-2 text-success fw-semibold">
                        <i className="ti ti-circle-check fs-5" />
                        Current plan
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary w-100 rounded-3 py-3 fw-semibold membership-plan-cta"
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {currentPlan ? "Switch to this plan" : "Subscribe"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card border-0 bg-light bg-opacity-50 rounded-4 p-4">
        <p className="small text-muted mb-0">
          <i className="ti ti-info-circle me-1" />
          Need custom limits for your shop? Use Feedback in the app or contact support. Payment and real subscription management will be connected in a later update.
        </p>
      </div>
    </div>
  );
}
