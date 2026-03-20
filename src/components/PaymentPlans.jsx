import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const premiumHighlights = [
  { title: "All Levels Access", text: "Unlock Basic, Intermediate, and Advanced across communication tracks." },
  { title: "Daily Premium Limits", text: "Get richer daily access for tests, practice, and premium-only analytics." },
  { title: "Detailed AI Insights", text: "See transcripts, audio review, confidence trend, and deeper feedback." },
  { title: "Faster Growth", text: "Build confidence with structured repetition, not random attempts." },
];

const premiumFeatures = [
  "Daily 2 tests across all levels",
  "Advanced test types and richer reports",
  "Detailed AI analysis and audio-backed feedback",
  "Advanced analytics and dashboard access",
  "Premium learning experience across modules",
];

const freeFeatures = [
  "Trial access to selected test counts",
  "Basic-level usage only",
  "Simple AI feedback",
  "Starter streak and progress tracking",
];

const trustItems = ["Secure Razorpay checkout", "Instant activation after verification", "One-time payment, no auto-renewal"];

const formatPrice = (raw) => {
  const n = Number(raw) || 0;
  const rupees = n > 999 ? Math.round(n / 100) : n;
  return rupees;
};

const formatPlanTitle = (type) => `${type.charAt(0).toUpperCase() + type.slice(1)} Plan`;

const unwrapPayload = (value) => {
  let current = value;

  for (let i = 0; i < 4; i += 1) {
    if (typeof current === "string") {
      try {
        current = JSON.parse(current);
        continue;
      } catch {
        return {};
      }
    }

    if (current && typeof current === "object" && "body" in current) {
      current = current.body;
      continue;
    }

    break;
  }

  return current && typeof current === "object" ? current : {};
};

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const PaymentPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");
  const [alreadyPremium, setAlreadyPremium] = useState(false);

  const redirectToProfile = (paymentSuccess = false) => {
    console.log("[payment-plans:redirect:start]", {
      paymentSuccess,
      currentPath: window.location.pathname,
      currentHref: window.location.href,
    });

    if (paymentSuccess) {
      sessionStorage.setItem("payment_success", "true");
    }

    navigate("/profiledata", { replace: true, state: paymentSuccess ? { paymentSuccess: true } : undefined });

    window.setTimeout(() => {
      console.log("[payment-plans:redirect:timeout-check]", {
        currentPath: window.location.pathname,
        currentHref: window.location.href,
      });
      if (window.location.pathname !== "/profiledata") {
        console.log("[payment-plans:redirect:hard-refresh]", {
          target: "/profiledata",
        });
        window.location.assign("/profiledata");
      }
    }, 150);
  };

  const confirmPremiumFromProfile = async (email) => {
    const profileApi = import.meta.env.VITE_STUDENT_PROFILE_API;
    if (!profileApi || !email) return false;

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const resp = await fetch(profileApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: createPayload({ action: "get_profile", college_email: email }),
        });

        const raw = await resp.text();
        const payload = unwrapPayload(raw);
        const userType = payload?.user_info?.user_type || payload?.user_type || "free";
        const paymentStatus = payload?.user_info?.payment_details?.status || payload?.payment_details?.status;
        const isPremium = userType === "premium" && paymentStatus === "success";

        console.log("[payment-plans:profile-recheck]", {
          attempt,
          status: resp.status,
          userType,
          paymentStatus,
          isPremium,
          payload,
        });

        if (isPremium) {
          localStorage.setItem("user_type", "premium");
          return true;
        }
      } catch (error) {
        console.error("[payment-plans:profile-recheck-error]", { attempt, error });
      }

      await wait(700);
    }

    return false;
  };

  useEffect(() => {
    const detectPremiumStatus = async () => {
      const profileApi = import.meta.env.VITE_STUDENT_PROFILE_API;
      const storedEmail = localStorage.getItem("email");

      if (!profileApi || !storedEmail) return;

      try {
        const resp = await fetch(profileApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: createPayload({ action: "get_profile", college_email: storedEmail }),
        });

        const raw = await resp.text();
        const payload = unwrapPayload(raw);
        const userType = payload?.user_info?.user_type || payload?.user_type || "free";
        const paymentStatus = payload?.user_info?.payment_details?.status || payload?.payment_details?.status;
        const isPremium = userType === "premium" && paymentStatus === "success";

        console.log("[payment-plans:premium-check]", {
          status: resp.status,
          userType,
          paymentStatus,
          isPremium,
          payload,
        });

        localStorage.setItem("user_type", userType);
        setAlreadyPremium(isPremium);

        if (isPremium && !location.state?.paymentSuccess) {
          redirectToProfile(false);
        }
      } catch {
        // Let the page continue even if profile lookup fails.
      }
    };

    detectPremiumStatus();
  }, [location.state]);

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
        const body = unwrapPayload(txt);
        const payload = body.data || body;
        const userPlans = payload.user_plans || {};
        const planDays = payload.plans_days || {};

        if (!Object.keys(userPlans).length) {
          setError(payload.message || "Plans are not configured. Please try again later.");
          return;
        }

        const built = Object.entries(userPlans).map(([type, value], index) => {
          const displayPrice = formatPrice(value);
          const durationDays = Number(planDays[type]) || 0;
          return {
            type,
            title: formatPlanTitle(type),
            priceValue: Number(value) || 0,
            displayPrice,
            durationDays,
            popular: index === 1,
          };
        });

        setPlans(built);
      } catch {
        setError("Unable to load plans. Please try again later.");
      } finally {
        setFetching(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (location.hash === "#pp-duration-section") {
      const timer = window.setTimeout(() => {
        const plansSection = document.getElementById("pp-duration-section");
        plansSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [location.hash]);

  useEffect(() => {
    if (!selectedPlan) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPlan]);

  const pricing = useMemo(() => {
    const basePrice = selectedPlan ? formatPrice(selectedPlan.priceValue) : 0;
    const taxAmount = Math.round(basePrice * 0.02);
    const totalAmount = basePrice + taxAmount;
    const perDay =
      selectedPlan?.durationDays && selectedPlan.durationDays > 0
        ? Math.round(basePrice / selectedPlan.durationDays)
        : 0;

    return { basePrice, taxAmount, totalAmount, perDay };
  }, [selectedPlan]);

  const handlePay = async (plan) => {
    if (!agree || !plan) return;

    const paymentApi = import.meta.env.VITE_PAYMENT_API || import.meta.env.VITE_PAYMENT_API_URL;
    const email = localStorage.getItem("email");
    if (!paymentApi) {
      setError("Payment API URL is not configured.");
      return;
    }
    if (!email) {
      setError("Unable to identify your account. Please log in again.");
      return;
    }

    setError("");
    setProcessingMessage("Preparing your secure checkout...");
    setPayLoading(true);

    try {
      const resp = await fetch(paymentApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: createPayload({ action: "create_order", college_email: email, plan_type: plan.type }),
      });

      const txt = await resp.text();
      const order = unwrapPayload(txt);

      console.log("[payment-plans:create-order-response]", {
        status: resp.status,
        ok: resp.ok,
        order,
      });

      if (!resp.ok || !order.order_id) {
        throw new Error(order.message || "Unable to create payment order");
      }

      await loadRazorpay();

      const rzp = new window.Razorpay({
        key: order.razorpay_key || order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Skill Route AI",
        description: plan.title,
        order_id: order.order_id,
        prefill: { email },
        theme: { color: "#3B9797" },
        modal: {
          ondismiss: () => {
            console.log("[payment-plans:razorpay-dismissed]");
            setPayLoading(false);
            setProcessingMessage("");
          },
        },
        handler: async (response) => {
          try {
            console.log("[payment-plans:razorpay-handler]", response);
            setProcessingMessage("Activating your premium access...");

            const verifyResp = await fetch(paymentApi, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: createPayload({
                action: "verify_payment",
                college_email: email,
                plan_type: plan.type,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyText = await verifyResp.text();
            const verifyBody = unwrapPayload(verifyText);
            const verifiedPremium =
              verifyBody.message === "Premium activated" ||
              verifyBody.user_type === "premium" ||
              verifyBody?.data?.user_type === "premium" ||
              verifyBody?.body?.user_type === "premium" ||
              verifyBody?.result?.user_type === "premium";

            console.log("[payment-plans:verify-response]", {
              status: verifyResp.status,
              ok: verifyResp.ok,
              verifyBody,
              verifyText,
              verifiedPremium,
            });

            if (verifyResp.ok && verifiedPremium) {
              localStorage.setItem("user_type", "premium");
              setAlreadyPremium(true);
              setSelectedPlan(null);
              redirectToProfile(true);
              return;
            }

            if (verifyResp.ok) {
              setProcessingMessage("Confirming premium activation on your profile...");
              const premiumConfirmed = await confirmPremiumFromProfile(email);

              if (premiumConfirmed) {
                setAlreadyPremium(true);
                setSelectedPlan(null);
                redirectToProfile(true);
                return;
              }
            }

            console.error("[payment-plans:verify-failed]", {
              status: verifyResp.status,
              verifyBody,
              verifyText,
            });
            setError("Payment verification failed. Please contact support.");
          } catch (error) {
            console.error("[payment-plans:verify-exception]", error);
            setError("Payment verification failed. Please contact support.");
          } finally {
            setPayLoading(false);
            setProcessingMessage("");
          }
        },
      });

      console.log("[payment-plans:razorpay-open]", {
        orderId: order.order_id,
        planType: plan.type,
      });
      rzp.open();
    } catch (error) {
      console.error("[payment-plans:create-order-exception]", error);
      setError("Payment initialization failed. Please try again.");
      setPayLoading(false);
      setProcessingMessage("");
    }
  };

  return (
    <>
      <Header />
      <div className="pp-page app-bg-free">
        <div className="pp-shell">
          {alreadyPremium ? (
            <div className="pp-alert pp-alert-info">
              Premium is already active on your account. Redirecting you to your profile...
            </div>
          ) : null}

          <section className="pp-hero">
            <div className="pp-hero-copy">
              <div className="pp-hero-badge">Premium Membership</div>
              <h1 className="pp-hero-title">Invest in the version of you that speaks with confidence.</h1>
              <p className="pp-hero-subtitle">
                Premium unlocks deeper practice, richer analytics, and a smoother daily learning flow across mobile,
                tablet, and laptop.
              </p>
              <div className="pp-hero-actions">
                <button
                  className="pp-primary-cta"
                  onClick={() => {
                    const plansSection = document.getElementById("pp-duration-section");
                    plansSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Choose a Plan
                </button>
                <button className="pp-secondary-cta" onClick={() => navigate("/profiledata")}>
                  Back to Profile
                </button>
              </div>
              <div className="pp-trust-row">
                {trustItems.map((item) => (
                  <span key={item} className="pp-trust-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="pp-hero-panel">
              <div className="pp-panel-glow" />
              <div className="pp-panel-card">
                <p className="pp-panel-label">Why learners upgrade</p>
                <div className="pp-panel-stats">
                  <div className="pp-stat">
                    <strong>All Levels</strong>
                    <span>Basic to Advanced access</span>
                  </div>
                  <div className="pp-stat">
                    <strong>AI Review</strong>
                    <span>Speech trend, transcript, and audio insights</span>
                  </div>
                  <div className="pp-stat">
                    <strong>Daily Momentum</strong>
                    <span>Build consistency, not random effort</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error ? <div className="pp-alert pp-alert-error">{error}</div> : null}
          {processingMessage ? <div className="pp-alert pp-alert-info">{processingMessage}</div> : null}

          <section className="pp-highlight-grid">
            {premiumHighlights.map((item) => (
              <article key={item.title} className="pp-highlight-card">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </section>

          <section className="pp-membership-showcase">
            <article className="pp-showcase-card pp-showcase-free">
              <span className="pp-showcase-tag">Free</span>
              <h2>Good for exploring</h2>
              <p>Start your journey, understand the flow, and experience the platform before upgrading.</p>
              <ul className="pp-feature-list">
                {freeFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>

            <article className="pp-showcase-card pp-showcase-premium">
              <span className="pp-showcase-tag">Premium</span>
              <h2>Built for serious daily growth</h2>
              <p>Get the full Tara AI experience with richer evaluation, better visibility, and premium daily access.</p>
              <ul className="pp-feature-list">
                {premiumFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="pp-duration-section" id="pp-duration-section">
            <div className="pp-section-head">
              <div>
                <p className="pp-section-kicker">Plan Options</p>
                <h2 className="pp-section-title">Choose the duration that matches your momentum.</h2>
              </div>
              <p className="pp-section-note">The longer the plan, the stronger the habit loop you can build.</p>
            </div>

            {fetching ? (
              <div className="pp-loading-card">
                <div className="pp-spinner" />
                <span>Loading available premium plans...</span>
              </div>
            ) : null}

            {!fetching && !plans.length && !error ? <p className="pp-empty-state">No plans available right now.</p> : null}

            <div className="pp-duration-grid">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.type === plan.type;
                const perDay = plan.durationDays ? Math.round(plan.displayPrice / plan.durationDays) : 0;

                return (
                  <button
                    key={plan.type}
                    type="button"
                    className={`pp-duration-card ${plan.popular ? "pp-duration-card-popular" : ""} ${
                      isSelected ? "pp-duration-card-selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setAgree(false);
                    }}
                  >
                    {plan.popular ? <span className="pp-duration-badge">Most Popular</span> : null}
                    <div className="pp-duration-top">
                      <div>
                        <p className="pp-duration-title">{plan.title}</p>
                        <h3>{plan.durationDays} Days</h3>
                      </div>
                      <span className="pp-duration-check">{isSelected ? "Selected" : "Pick"}</span>
                    </div>
                    <div className="pp-duration-price-row">
                      <strong>Rs {plan.displayPrice}</strong>
                      <span>Rs {perDay || 0}/day</span>
                    </div>
                    <p className="pp-duration-copy">Best for learners who want consistent speaking progress and stronger daily rhythm.</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pp-layout-grid">
            <div className="pp-story-card">
              <p className="pp-section-kicker">What changes after payment</p>
              <h2>Premium turns your profile into a true progress hub.</h2>
              <p>
                After successful payment, you are taken directly back to your profile where premium membership,
                updated access, and refreshed usage are reflected.
              </p>
              <div className="pp-story-points">
                <div>
                  <strong>Faster clarity</strong>
                  <span>See what to improve without guessing.</span>
                </div>
                <div>
                  <strong>Better consistency</strong>
                  <span>Premium supports daily discipline with a cleaner routine.</span>
                </div>
                <div>
                  <strong>More confidence</strong>
                  <span>Practice and analytics work together to build speaking comfort.</span>
                </div>
              </div>
            </div>

            <aside className="pp-checkout-card pp-checkout-card-preview">
              <div className="pp-checkout-header">
                <div>
                  <p className="pp-checkout-label">Checkout Flow</p>
                  <h3>Select a plan to continue.</h3>
                  <span>Your chosen plan opens in a focused premium popup.</span>
                </div>
              </div>
              <div className="pp-story-points">
                <div>
                  <strong>Focused selection</strong>
                  <span>Your selected plan is highlighted inside a dedicated popup.</span>
                </div>
                <div>
                  <strong>Background locked</strong>
                  <span>Scrolling behind the popup is disabled so payment stays distraction-free.</span>
                </div>
                <div>
                  <strong>Clear confirmation</strong>
                  <span>Review duration, total, and payment terms before continuing.</span>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>

      {selectedPlan ? (
        <div className="pp-modal-backdrop" onClick={() => setSelectedPlan(null)}>
          <div className="pp-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="pp-checkout-header">
              <div>
                <p className="pp-checkout-label">Selected Plan</p>
                <h3>{selectedPlan.title}</h3>
                <span>{selectedPlan.durationDays} days of premium access</span>
              </div>
              <button className="pp-close-btn" onClick={() => setSelectedPlan(null)} type="button">
                Close
              </button>
            </div>

            <div className="pp-selected-highlight">
              <span className="pp-selected-badge">Premium Access</span>
              <strong>{selectedPlan.title}</strong>
              <p>{selectedPlan.durationDays} days of premium access</p>
            </div>

            <div className="pp-breakdown">
              <div className="pp-breakdown-row">
                <span>Plan price</span>
                <strong>Rs {pricing.basePrice}</strong>
              </div>
              <div className="pp-breakdown-row">
                <span>Tax (2%)</span>
                <strong>Rs {pricing.taxAmount}</strong>
              </div>
              <div className="pp-breakdown-row">
                <span>Approx. per day</span>
                <strong>Rs {pricing.perDay}</strong>
              </div>
              <div className="pp-breakdown-row pp-breakdown-total">
                <span>Total payable</span>
                <strong>Rs {pricing.totalAmount}</strong>
              </div>
            </div>

            <label className="pp-agree-box">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="pp-agree-indicator" />
              <span>
                I understand this is a one-time payment, premium access activates after verification, and the shown
                total includes 2% tax.
              </span>
            </label>

            <button
              className={`pp-pay-button ${!selectedPlan || !agree || payLoading ? "pp-pay-button-disabled" : ""}`}
              type="button"
              disabled={!selectedPlan || !agree || payLoading}
              onClick={() => handlePay(selectedPlan)}
            >
              {payLoading ? "Processing Payment..." : `Pay Rs ${pricing.totalAmount}`}
            </button>

            <p className="pp-checkout-note">Payment is processed securely through Razorpay.</p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PaymentPlans;
