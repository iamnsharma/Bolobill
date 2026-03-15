import { useState, useEffect, useCallback } from "react";
import { useRazorpay } from "react-razorpay";
import { adminApi } from "../api/admin";
import { useAuth } from "../contexts/AuthContext";

export default function Memberships() {
  const { Razorpay } = useRazorpay();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fallback to determine current plan ID
  const currentPlanId = user?.subscription?.planId?._id 
    || (typeof user?.subscription?.planId === 'string' ? user.subscription.planId : null);

  const currentPlan = plans.find(p => p._id === currentPlanId);

  useEffect(() => {
    adminApi.getPlans().then(fetched => {
      setPlans(fetched);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = useCallback(async (plan: any) => {
    if (processingId) return;
    setProcessingId(plan._id);
    try {
      const orderRes = await adminApi.createPaymentOrder(plan._id);
      
      if (orderRes.isFree) {
        alert("Plan assigned successfully");
        window.location.reload();
        return;
      }
      
      const options = {
        key: orderRes.keyId || "",
        amount: orderRes.amount || 0,
        currency: (orderRes.currency || "INR") as "INR",
        name: "BoloBill",
        description: `Subscription for ${plan.name}`,
        order_id: orderRes.orderId || "",
        handler: async (response: any) => {
          try {
            await adminApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: plan._id,
            });
            alert("Payment successful! Your membership is active.");
            window.location.reload();
          } catch (e: any) {
            alert(e?.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "BoloBill User",
          contact: user?.phone || "",
        },
        theme: {
          color: "#4facfe",
        },
      };

      const rzpInstance = new Razorpay(options);
      rzpInstance.on("payment.failed", function (response: any) {
        alert(response.error.description || "Payment Failed");
      });
      rzpInstance.open();
      
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to initialize payment");
    } finally {
      setProcessingId(null);
    }
  }, [Razorpay, user, processingId]);

  if (loading) return <div className="mt-6 admin-page p-4 text-center">Loading plans...</div>;

  return (
    <div className="mt-6 admin-page membership-page">
      {/* Hero */}
      <div className="membership-hero rounded-4 overflow-hidden mb-5">
        <div className="membership-hero-inner">
          <span className="membership-hero-badge">Plans</span>
          <h1 className="membership-hero-title">Choose your growth plan</h1>
          <p className="membership-hero-sub">
            Bill limits reset on your renewal date each month. Upgrade or change
            plan anytime.
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
                    src={currentPlan.icon || "/membership/starter.png"}
                    alt={currentPlan.name}
                    className="membership-current-icon"
                  />
                ) : (
                  <i className="ti ti-crown fs-2 text-warning" />
                )}
              </div>
              <div>
                <h2 className="h5 fw-bold mb-1">
                  {currentPlan
                    ? `Your plan: ${currentPlan.name}`
                    : "No active membership"}
                </h2>
                <p className="text-muted small mb-0">
                  {currentPlan
                    ? `You're on ${currentPlan.name} — ${currentPlan.invoiceLimits?.toLocaleString() || 0} bills/month.`
                    : "Subscribe to a plan below to unlock billing limits and features."}
                </p>
              </div>
            </div>
            {currentPlan && (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-3">
                  <i className="ti ti-check me-1" />
                  Active
                </button>
              </div>
            )}
          </div>
          {currentPlan?.features?.length > 0 && (
            <div className="mt-3 pt-3 border-top">
              <p className="small text-muted mb-0">
                <strong>What you get:</strong>{" "}
                {currentPlan.features.join(" · ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* All plans */}
      <h2 className="h5 fw-bold mb-3">All plans</h2>
      <p className="text-muted small mb-4">
        Compare and choose. You can upgrade or switch plan anytime.
      </p>

      <div className="row g-4 mb-5">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan._id;
          return (
            <div key={plan._id} className="col-md-6 col-lg-4">
              <div
                className={`membership-plan-card card border-0 h-100 overflow-hidden rounded-4 ${isCurrent ? "membership-plan-card--active" : ""}`}
                style={
                  { "--plan-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" } as React.CSSProperties
                }>
                <div className="membership-plan-card-gradient" />
                <div className="card-body position-relative p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="membership-plan-icon-wrap rounded-3 overflow-hidden">
                      <img
                        src={plan.icon || "/membership/starter.png"}
                        alt={plan.name}
                        className="membership-plan-icon"
                      />
                    </div>
                    <div>
                      <h3 className="h4 fw-bold mb-0 text-dark">{plan.name}</h3>
                      <p className="text-primary fw-semibold mb-0">
                        ₹{plan.price?.toLocaleString()}
                        <span className="fw-normal text-muted small">
                          {" "}
                          / month
                        </span>
                      </p>
                    </div>
                  </div>
                  <ul className="list-unstyled small mb-4 mt-3">
                    {plan.features?.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="d-flex align-items-center gap-2 mb-2">
                        <i className="ti ti-check text-success flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    <li className="d-flex align-items-center gap-2 mb-2">
                      <i className="ti ti-check text-success flex-shrink-0" />
                      <span>{plan.invoiceLimits} Invoices / month</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 mb-2">
                      <i className="ti ti-check text-success flex-shrink-0" />
                      <span>{plan.voiceDurationLimits} Voice Info Mins</span>
                    </li>
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
                        disabled={processingId === plan._id}
                        onClick={() => handleSubscribe(plan)}>
                        {processingId === plan._id ? "Processing..." : (currentPlan ? "Switch to this plan" : "Subscribe")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {plans.length === 0 && (
         <div className="card border-0 bg-light rounded-4 p-5 text-center">
         <p className="text-muted mb-0">No plans available at the moment.</p>
       </div>
      )}
    </div>
  );
}
