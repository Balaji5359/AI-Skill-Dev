import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./profile.css";
import "./profile-payment.css";

const createPayload = (payload) => JSON.stringify(payload);

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.body.appendChild(script);
  });

const premiumFeatures = [
  "Daily 2 tests across all levels",
  "Advanced test types",
  "Detailed AI analysis & audio feedback",
  "Advanced analytics & badges",
  "All levels access",
];

const formatPrice = (raw) => {
  const n = Number(raw) || 0;
  // Admin stores paise-like values (e.g., 9900) for ₹99; if value > 999 assume paise
  const rupees = n > 999 ? Math.round(n / 100) : n;
  return rupees;
};
const formatRupees = (raw) => `₹${formatPrice(raw)}`;

const PaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      const paymentApi = import.meta.env.VITE_PAYMENT_API || import.meta.env.VITE_PAYMENT_API_URL;
      if (!paymentApi) {
        setError("Payment API URL is not configured.");
        return;
      }
      setFetching(true);
      try {
        const resp = await fetch(paymentApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: createPayload({ action: "get_plans" }),
        });
        if (!resp.ok) {
          setError(`Plans API error ${resp.status}`);
          return;
        }
        const txt = await resp.text();
        const parsed = txt ? JSON.parse(txt) : {};
        const body = typeof parsed.body === "string" ? JSON.parse(parsed.body) : parsed;
        const payload = body.data || body; // some backends wrap in {data: {...}}
        console.log("plans api raw", { status: resp.status, body: payload });
        const user_plans = payload.user_plans || {};
        const plans_days = payload.plans_days || {};
        if (!Object.keys(user_plans).length) {
          setError(payload.message || "Plans are not configured. Please try again later.");
          return;
        }
        const built = Object.entries(user_plans).map(([k, v]) => {
          const days = plans_days[k] || "";
          const rupees = formatPrice(v);
          return {
            type: k,
            priceValue: Number(v) || 0,
            displayPrice: rupees,
            durationDays: days,
            title: `${k.charAt(0).toUpperCase() + k.slice(1)} Plan`,
          };
        });
        setPlans(built);
      } catch (e) {
        console.error("Unable to load plans", e);
        setError("Unable to load plans. Please try again later.");
      } finally {
        setFetching(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePay = async (plan) => {
    if (!agree) {
      alert("Please agree to the Terms & Conditions to proceed.");
      return;
    }
    const paymentApi = import.meta.env.VITE_PAYMENT_API || import.meta.env.VITE_PAYMENT_API_URL;
    if (!paymentApi) {
      alert("Payment API URL is not configured.");
      return;
    }
    setPayLoading(true);
    try {
      const email = localStorage.getItem("email");
      const resp = await fetch(paymentApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: createPayload({
          action: "create_order",
          college_email: email,
          plan_type: plan.type,
        }),
      });
      const txt = await resp.text();
      const parsed = txt ? JSON.parse(txt) : {};
      const order = typeof parsed.body === "string" ? JSON.parse(parsed.body) : parsed;

      await loadRazorpay();

      const rzp = new window.Razorpay({
        key: order.razorpay_key,
        amount: order.amount,
        currency: order.currency,
        name: "Skill Route",
        description: plan.title,
        order_id: order.order_id,
        handler: async (r) => {
          try {
            const verifyResp = await fetch(paymentApi, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: createPayload({
                action: "verify_payment",
                college_email: email,
                plan_type: plan.type,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_order_id: r.razorpay_order_id,
                razorpay_signature: r.razorpay_signature,
              }),
            });
            
            const verifyResult = await verifyResp.json();
            const verifyBody = typeof verifyResult.body === "string" ? JSON.parse(verifyResult.body) : verifyResult;
            
            if (verifyResp.ok && verifyBody.message === "Premium activated") {
              alert("Payment successful! Premium activated.");
              window.location.href = "/profiledata";
            } else {
              alert("Payment verification failed. Please contact support.");
              console.error("Payment verification failed:", verifyBody);
            }
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
            console.error("Payment verification error:", error);
          }
        },
        modal: { ondismiss: () => setPayLoading(false) },
        prefill: { email },
        theme: { color: "#3B9797" },
      });
      rzp.open();
    } catch (err) {
      console.error("Payment init error:", err);
      alert("Payment initialization failed. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  const basePrice = selectedPlan ? formatPrice(selectedPlan.priceValue) : 0;
  const taxAmount = Math.round(basePrice * 0.02);
  const totalAmount = basePrice + taxAmount;

  return (
    <>
      <Header />
      <div className="profile-container app-bg-free">
        <div className="profile-content">
          <h1 className="profile-greeting-title mb-4">Choose Your Plan</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="grid grid-cols-1 gap-4">
            <div className="profile-plan-card premium-card">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <h3>Premium Plans</h3>
                  <div className="profile-plan-price">Pick your duration</div>
                  <p className="text-sm text-muted-foreground">Full access to all levels and analytics.</p>
                </div>
              </div>

              <div className="profile-plan-features mt-2">
                {premiumFeatures.map((f) => (
                  <div key={f} className="profile-plan-feature">
                    • {f}
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mt-4 mb-2">Available plans</p>

              {fetching && <p className="text-sm text-muted-foreground">Loading plans…</p>}
              {!fetching && !plans.length && !error && (
                <p className="text-sm text-muted-foreground">No plans available right now.</p>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plans.map((p, idx) => (
                  <div key={p.type} className={`profile-plan-card inner ${idx === 1 ? "best-value" : ""}`}>
                    {idx === 1 && <div className="profile-plan-badge">Most Popular</div>}
                    <div className="profile-plan-header">
                      <h4>{p.title}</h4>
                      <div className="profile-plan-price">₹{p.displayPrice}</div>
                      <p>{p.durationDays} days</p>
                    </div>
                    <button
                      className="profile-select-plan-btn w-full"
                      onClick={() => {
                        setSelectedPlan(p);
                        setAgree(false);
                      }}
                    >
                      Select {p.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedPlan && (
            <div className="profile-payment-modal inline-modal">
              <div className="profile-payment-card">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Selected plan</p>
                    <h3 className="text-lg font-semibold">{selectedPlan.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan.durationDays} days • {formatRupees(selectedPlan.priceValue)}
                    </p>
                  </div>
                  <button className="profile-cancel-btn" onClick={() => setSelectedPlan(null)}>
                    ×
                  </button>
                </div>

                <div className="profile-payment-breakdown mt-3">
                  <div className="profile-price-row">
                    <span>Plan Price:</span>
                    <span>₹{basePrice}</span>
                  </div>
                  <div className="profile-price-row">
                    <span>Tax (2%):</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <div className="profile-price-row profile-total">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                <label className="profile-checkbox-container mt-3">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span className="profile-checkmark"></span>
                  <span className="profile-terms-text">
                    I agree that this is a one-time, non-refundable payment. Total includes 2% tax.
                  </span>
                </label>

                <div className="profile-payment-actions">
                  <button className="profile-cancel-btn" onClick={() => setSelectedPlan(null)}>
                    Cancel
                  </button>
                  <button
                    className={`profile-proceed-btn ${!agree ? "disabled" : ""}`}
                    onClick={() => handlePay(selectedPlan)}
                    disabled={payLoading || !agree}
                  >
                    {payLoading ? "Processing..." : "Proceed to Pay"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentPlans;
