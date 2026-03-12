import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { profileAPI, platformAPI } from '../services/api';
import './profile.css';
import './profile-payment.css';

function ProfileData() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [streakData, setStreakData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");
    const [motivationalQuote, setMotivationalQuote] = useState("");
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

    const quotes = [
        "The limits of my language mean the limits of my world. - Ludwig Wittgenstein",
        "To have another language is to possess a second soul. - Charlemagne",
        "Language is the road map of a culture. - Rita Mae Brown",
        "Communication is the most important skill you can develop. - Warren Buffett",
        "The art of communication is the language of leadership. - James Humes"
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedEmail = localStorage.getItem("email");
                
                const [profile, streak] = await Promise.all([
                    profileAPI.get(storedEmail),
                    platformAPI.updateStreak(storedEmail, true)
                ]);

                if (profile.statusCode !== 200) {
                    throw new Error(`Profile API failed: ${profile.statusCode}`);
                }
                if (streak.statusCode !== 200) {
                    throw new Error(`Streak API failed: ${streak.statusCode}`);
                }
                
                setProfileData(profile);
                setStreakData(streak);

                const hour = new Date().getHours();
                if (hour < 12) setGreeting("Good Morning");
                else if (hour < 17) setGreeting("Good Afternoon");
                else setGreeting("Good Evening");
                
                setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Set default data when API fails
                setProfileData({
                    full_name: "Student",
                    user_type: "free",
                    premium_status: "inactive"
                });
                setStreakData({
                    current_streak: 0,
                    longest_streak: 0,
                    active_dates: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Disable background scrolling when modals are open
    useEffect(() => {
        const modalOpen = showPricingModal || showPaymentModal;
        if (modalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => { document.body.style.overflow = ''; };
    }, [showPricingModal, showPaymentModal]);

    const isPremium = profileData?.user_type === 'premium' && profileData?.premium_status === 'active';

    if (loading) {
        return (
            <div className="app-loading-container app-bg-free">
                <div className="app-loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="profile-container app-bg-free">
                <div className="profile-content">
                    <GreetingCard 
                        greeting={greeting} 
                        name={profileData?.full_name} 
                        quote={motivationalQuote} 
                    />
                    
                    <div className="profile-dashboard-grid">
                        {isPremium ? (
                            <>
                                <PremiumInfoCard 
                                    plan={profileData.premium_plan} 
                                    startDate={profileData.premium_start_date} 
                                />
                                <DaysLeftCard 
                                    daysLeft={profileData.premium_days_left}
                                    expiryDate={profileData.premium_expiry_date}
                                />
                            </>
                        ) : (
                            <FreeVsPremiumCard onUpgrade={() => setShowPricingModal(true)} />
                        )}
                        
                        <StreakCard 
                            currentStreak={streakData?.current_streak}
                            longestStreak={streakData?.longest_streak}
                        />
                    </div>

                    <div className="profile-dashboard-bottom">
                        <ActivityCalendar 
                            activeDates={streakData?.active_dates} 
                            currentDate={currentCalendarDate}
                            onDateChange={setCurrentCalendarDate}
                        />
                        <QuickActions navigate={navigate} />
                    </div>
                </div>
            </div>
            
            {showPricingModal && (
                <PricingModal 
                    onClose={() => setShowPricingModal(false)}
                    onSelectPlan={(plan) => {
                        setSelectedPlan(plan);
                        setShowPricingModal(false);
                        setShowPaymentModal(true);
                    }}
                />
            )}
            
            {showPaymentModal && selectedPlan && (
                <PaymentModal 
                    plan={selectedPlan}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedPlan(null);
                    }}
                    profileData={profileData}
                />
            )}
        </>
    );
}

const parsePaymentApiResponse = async (response) => {
    const responseText = await response.text();
    let parsed;

    try {
        parsed = JSON.parse(responseText);
    } catch (parseError) {
        console.error('Payment JSON Parse Error:', parseError);
        console.error('Payment Response:', responseText.substring(0, 200));
        throw new Error('Invalid JSON response from payment API');
    }

    if (typeof parsed?.statusCode === 'number' && parsed.statusCode >= 400) {
        let errorMessage = 'Payment API request failed';

        if (typeof parsed.body === 'string') {
            try {
                const errorBody = JSON.parse(parsed.body);
                errorMessage = errorBody?.message || errorMessage;
            } catch {
                errorMessage = parsed.body || errorMessage;
            }
        } else if (parsed?.message) {
            errorMessage = parsed.message;
        }

        throw new Error(errorMessage);
    }

    if (parsed?.body && typeof parsed.body === 'string') {
        try {
            return JSON.parse(parsed.body);
        } catch (parseError) {
            console.error('Payment Nested JSON Parse Error:', parseError);
            console.error('Payment Nested Response:', parsed.body.substring(0, 200));
            throw new Error('Invalid nested JSON response from payment API');
        }
    }

    return parsed;
};

const createPaymentPayload = (payload) => JSON.stringify(payload);



const GreetingCard = ({ greeting, name, quote }) => (
    <div className="profile-greeting-card">
        <h1 className="profile-greeting-title">
            {greeting}, {name || "Student"}! <span>👋</span>
        </h1>
        <p className="profile-motivational-quote">"{quote}"</p>
    </div>
);

const PremiumInfoCard = ({ plan, startDate }) => (
    <div className="profile-premium-info-card">
        <div className="profile-premium-header">
            <div className="profile-premium-icon">👑</div>
            <h3>Premium Member</h3>
        </div>
        <p className="profile-premium-plan">Plan: {plan?.charAt(0).toUpperCase() + plan?.slice(1)}</p>
        <p className="profile-premium-date">Started: {new Date(startDate).toLocaleDateString()}</p>
    </div>
);

const DaysLeftCard = ({ daysLeft, expiryDate }) => (
    <div className="profile-days-left-card">
        <h3>Days Left</h3>
        <div className="profile-days-number">{daysLeft}</div>
        <p className="profile-expiry-date">Expires: {new Date(expiryDate).toLocaleDateString()}</p>
    </div>
);

const FreeVsPremiumCard = ({ onUpgrade }) => (
    <div className="profile-free-vs-premium-card">
        <div className="profile-card-header">
            <h3>Free vs Premium</h3>
            <div className="profile-premium-badge">🌟</div>
        </div>
        
        <div className="profile-comparison-container">
            <div className="profile-plan-box profile-free-box">
                <div className="profile-plan-header">
                    <h4>Free Plan</h4>
                    <span className="profile-plan-price">₹0</span>
                </div>
                <div className="profile-features-list">
                    <div className="profile-feature-item">✓ 2 tests - for trial</div>
                    <div className="profile-feature-item">✓ Basic tests only</div>
                    <div className="profile-feature-item">✓ Simple AI feedback</div>
                    <div className="profile-feature-item">✓ Basic streak tracking</div>
                    <div className="profile-feature-item limited">✗ No advanced analytics</div>
                </div>
            </div>
            
            <div className="profile-plan-box profile-premium-box">
                <div className="profile-plan-header">
                    <h4>Premium Plan</h4>
                    <span className="profile-plan-price">₹99+</span>
                </div>
                <div className="profile-features-list">
                    <div className="profile-feature-item">✓ Daily 2 tests of all Levels</div>
                    <div className="profile-feature-item">✓ Advanced test types</div>
                    <div className="profile-feature-item">✓ Detailed AI analysis & audio feedback</div>
                    <div className="profile-feature-item">✓ Advanced analytics & Badges</div>
                    <div className="profile-feature-item">✓ All Levels Access</div>
                </div>
            </div>
        </div>
        
        <center>
        <button className="profile-upgrade-btn" onClick={onUpgrade}>
                <center><span className="profile-btn-text">Buy Premium</span></center>
        </button>
        </center>
    </div>
);

const StreakCard = ({ currentStreak, longestStreak }) => (
    <div className="profile-streak-card">
        <h3>Daily Streak</h3>
        <div className="profile-streak-stats">
            <div className="profile-streak-item">
                <div className="profile-streak-number current">{currentStreak || 0}</div>
                <p>Current</p>
            </div>
            <div className="profile-streak-item">
                <div className="profile-streak-number longest">{longestStreak || 0}</div>
                <p>Longest</p>
            </div>
        </div>
    </div>
);

const ActivityCalendar = ({ activeDates, currentDate, onDateChange }) => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const activeDaysCount = activeDates?.filter(dateStr => {
        const date = new Date(dateStr);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length || 0;
    
    const navigateMonth = (direction) => {
        const newDate = new Date(currentYear, currentMonth + direction, 1);
        const today = new Date();
        
        // Don't allow navigation to future months
        if (direction > 0 && newDate > today) {
            return;
        }
        
        onDateChange(newDate);
    };
    
    const canNavigateNext = () => {
        const nextMonth = new Date(currentYear, currentMonth + 1, 1);
        const today = new Date();
        return nextMonth <= today;
    };
    
    const calendarDays = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="profile-calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isActive = activeDates?.includes(dateStr);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        calendarDays.push(
            <div
                key={day}
                className={`profile-calendar-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                title={`${monthName} ${day}${isActive ? ' - Active' : ''}`}
            >
                {day}
            </div>
        );
    }
    
    return (
        <div className="profile-activity-calendar">
            <div className="profile-calendar-header">
                <h3>Activity Calendar</h3>
                <div className="profile-calendar-navigation">
                    <button 
                        className="profile-nav-btn" 
                        onClick={() => navigateMonth(-1)}
                        title="Previous month"
                    >
                        ←
                    </button>
                    <div className="profile-calendar-stats">
                        <span className="profile-month-name">{monthName}</span>
                        <span className="profile-active-count">{activeDaysCount} active days</span>
                    </div>
                    <button 
                        className={`profile-nav-btn ${!canNavigateNext() ? 'disabled' : ''}`}
                        onClick={() => navigateMonth(1)}
                        disabled={!canNavigateNext()}
                        title="Next month"
                    >
                        →
                    </button>
                </div>
            </div>
            
            <div className="profile-calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="profile-weekday-label">{day}</div>
                ))}
            </div>
            
            <div className="profile-calendar-grid-month">
                {calendarDays}
            </div>
        </div>
    );
};

const QuickActions = ({ navigate }) => (
    <div className="profile-quick-actions">
        <h3>Quick Actions</h3>
        <div className="profile-actions-grid">
            <button className="profile-action-btn" onClick={() => navigate('/test')}>
                <div className="profile-action-icon">🎤</div>
                <div className="profile-action-text">
                    <div className="profile-action-title">Quick Start Tests Now</div>
                    <div className="profile-action-desc">Test your Communication skills now</div>
                </div>
            </button>
            <button className="profile-action-btn" onClick={() => navigate('/test')}>
                <div className="profile-action-icon">🗣️</div>
                <div className="profile-action-text">
                    <div className="profile-action-title">Start Practice Now</div>
                    <div className="profile-action-desc">Daily practices makes you perfect</div>
                </div>
            </button>
            <button className="profile-action-btn" onClick={() => navigate('/student-dashboard')}>
                <div className="profile-action-icon">📊</div>
                <div className="profile-action-text">
                    <div className="profile-action-title">View Progress</div>
                    <div className="profile-action-desc">Check AI-Feedback and analytics dashboard</div>
                </div>
            </button>
        </div>
    </div>
);

const PricingModal = ({ onClose, onSelectPlan }) => {
    const plans = [
        {
            price: "₹99",
            title: "1 Month Premium",
            type: "monthly",
            features: [
                "2 Communication Tests (Daily) - All Level",
                "1 Image-Based Speaking (Daily) - All Level",
                "TaraAI-guided 2 practice modules daily",
                "2-free trails for Image-Based Speaking",
                "Interview Modules Basic, Advance and communication all Levels - Unlock",
                "AI Feedback on Every Attempt",
                "Advanced analytics, Confident scores",
                "Audio replay & AI pronunciation insights",
                "Advanced analytics dashboard",
                "Leaderboards & streak rewards"
            ]
        },
        {
            price: "₹249",
            title: "3 Month Premium",
            type: "quarterly",
            features: [
                "2 Communication Tests (Daily) - All Level",
                "1 Image-Based Speaking (Daily) - All Level",
                "TaraAI-guided 2 practice modules daily",
                "2-free trails for Image-Based Speaking",
                "Interview Modules Basic, Advance and communication all Levels - Unlock",
                "AI Feedback on Every Attempt",
                "Advanced analytics, Confident scores",
                "Audio replay & AI pronunciation insights",
                "Advanced analytics dashboard",
                "Leaderboards & streak rewards"
            ]
        },
        {
            price: "₹799",
            title: "12 Month Premium 🌟",
            type: "yearly",
            badge: "Best Value",
            features: [
                "2 Communication Tests (Daily) - All Level",
                "1 Image-Based Speaking (Daily) - All Level",
                "TaraAI-guided 2 practice modules daily",
                "2-free trails for Image-Based Speaking",
                "Interview Modules Basic, Advance and communication all Levels - Unlock",
                "AI Feedback on Every Attempt",
                "Advanced analytics, Confident scores",
                "Audio replay & AI pronunciation insights",
                "Advanced analytics dashboard",
                "Leaderboards & streak rewards"
            ]
        }
    ];

    return (
        <div className="app-modal-overlay" onClick={onClose}>
            <div className="profile-pricing-modal" onClick={(e) => e.stopPropagation()}>
                <center><button className="app-modal-close" onClick={onClose}>×</button></center>
                <h2>Choose Your Premium Plan</h2>
                <div className="profile-pricing-plans">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`profile-pricing-plan ${plan.badge ? 'best-value' : ''}`}>
                            {plan.badge && <div className="profile-plan-badge">{plan.badge}</div>}
                            <div className="profile-plan-price">{plan.price}</div>
                            <div className="profile-plan-title">{plan.title}</div>
                            <ul className="profile-plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>✓ {feature}</li>
                                ))}
                            </ul>
                            <button 
                                className="profile-select-plan-btn"
                                onClick={() => onSelectPlan(plan)}
                            >
                                Select Plan
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PaymentModal = ({ plan, onClose, profileData }) => {
    const [loading, setLoading] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    
    const basePrice = parseFloat(plan.price.replace('₹', ''));
    const taxAmount = Math.round(basePrice * 0.02);
    const totalAmount = basePrice + taxAmount;

    const handlePayment = async () => {
        if (!agreeToTerms) {
            alert('Please agree to the Terms & Conditions to proceed.');
            return;
        }
        
        if (!window.Razorpay) {
            alert('Payment gateway not loaded. Please refresh the page and try again.');
            return;
        }

        setLoading(true);
        try {
            const email = profileData?.college_email || localStorage.getItem("email");
            
            const response = await fetch(import.meta.env.VITE_PAYMENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: createPaymentPayload({
                    action: "create_order",
                    college_email: email,
                    plan_type: plan.type
                })
            });

            if (!response.ok) {
                throw new Error(`Payment API failed: ${response.status}`);
            }

            const orderData = await parsePaymentApiResponse(response);

            const options = {
                key: orderData.razorpay_key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Skill Route",
                description: plan.title,
                order_id: orderData.order_id,
                handler: async (response) => {
                    await verifyPayment(response, email, plan.type);
                },
                prefill: { email: email },
                theme: { color: "#3B9797" },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment initialization failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentResponse, email, planType) => {
        try {
            const response = await fetch(import.meta.env.VITE_PAYMENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: createPaymentPayload({
                    action: "verify_payment",
                    college_email: email,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    plan_type: planType
                })
            });
            
            if (!response.ok) {
                throw new Error(`Payment verification failed: ${response.status}`);
            }

            try {
                await parsePaymentApiResponse(response);
                alert('Payment successful! Premium activated.');
                window.location.reload();
            } catch (parseError) {
                console.error('Verification JSON Parse Error:', parseError);
                alert('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support.');
        }
    };

    return (
        <div className="app-modal-overlay" onClick={onClose}>
            <div className="profile-payment-modal" onClick={(e) => e.stopPropagation()}>
                <button className="app-modal-close" onClick={onClose}>×</button>
                <h2>Complete Your Purchase</h2>
                
                <div className="profile-payment-details">
                    <div className="profile-payment-plan">
                        <h3>{plan.title}</h3>
                        <div className="profile-payment-breakdown">
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
                    </div>
                    
                    <div className="profile-payment-terms">
                        <label className="profile-checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                            />
                            <span className="profile-checkmark"></span>
                            <span className="profile-terms-text">
                                T&C - I understand that this is a one-time, 
                                non-refundable payment and the total amount includes 2% applicable tax.
                            </span>
                        </label>
                        
                        <button 
                            className="profile-terms-link"
                            onClick={() => setShowTerms(true)}
                        >
                            Terms & Conditions apply - click here to know more
                        </button>
                    </div>
                    
                    <p className="profile-payment-note">
                        You will be redirected to our secure payment gateway to complete your purchase.
                    </p>
                </div>
                
                <div className="profile-payment-actions">
                    <button className="profile-cancel-btn" onClick={onClose}>Cancel</button>
                    <button 
                        className={`profile-proceed-btn ${!agreeToTerms ? 'disabled' : ''}`}
                        onClick={handlePayment}
                        disabled={loading || !agreeToTerms}
                    >
                        {loading ? 'Processing...' : `Pay Now ₹${totalAmount}`}
                    </button>
                </div>
            </div>
            
            {showTerms && (
                <div className="app-modal-overlay" onClick={() => setShowTerms(false)}>
                    <div className="profile-terms-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="app-modal-close" onClick={() => setShowTerms(false)}>×</button>
                        <h2>Premium Subscription – Terms & Conditions</h2>
                        <div className="profile-terms-content">
                            <div className="profile-terms-section">
                                <h3>One-Time Payment</h3>
                                <p>The Premium subscription is available through a one-time payment only. No recurring charges are involved.</p>
                            </div>
                            
                            <div className="profile-terms-section">
                                <h3>No Refund Policy</h3>
                                <p>All payments made for the Premium plan are final and non-refundable. Refunds will not be provided for partial usage, non-usage, dissatisfaction, accidental purchases, or change of mind.</p>
                            </div>
                            
                            <div className="profile-terms-section">
                                <h3>Pricing & Tax</h3>
                                <p>The total amount displayed at checkout includes a 2% applicable tax. No additional charges will be applied beyond the displayed price.</p>
                            </div>
                            
                            <div className="profile-terms-section">
                                <h3>User Responsibility</h3>
                                <p>Users are advised to review all Premium features, limitations, and Terms & Conditions carefully before proceeding with the payment. By making the payment, the user confirms full understanding and acceptance.</p>
                            </div>
                            
                            <div className="profile-terms-section">
                                <h3>Payment Confirmation</h3>
                                <p>Premium access will be activated only after successful payment verification through the payment gateway. Frontend payment success alone does not guarantee activation.</p>
                            </div>
                            
                            <div className="profile-terms-section">
                                <h3>Misuse & Access Termination</h3>
                                <p>Any misuse of the platform, violation of policies, or unethical activity may result in termination of Premium access without refund.</p>
                            </div>
                        </div>
                        <button className="profile-terms-close-btn" onClick={() => setShowTerms(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileData;
