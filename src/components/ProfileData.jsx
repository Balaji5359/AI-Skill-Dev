import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { profileAPI, platformAPI } from '../services/api';
import './profile.css';

const createPaymentPayload = (payload) => JSON.stringify(payload);
const parsePaymentApiResponse = async (response) => {
    const txt = await response.text();
    try {
        return JSON.parse(txt);
    } catch {
        return {};
    }
};

function ProfileData() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [streakData, setStreakData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");
    const [motivationalQuote, setMotivationalQuote] = useState("");
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
                    profileAPI.get(storedEmail).catch(() => ({ statusCode: 400 })),
                    platformAPI.updateStreak(storedEmail, true).catch(() => ({ statusCode: 400 }))
                ]);

                const fallbackProfile = {
                    full_name: "Student",
                    user_type: "free",
                    college_email: storedEmail
                };

                const resolvedProfile = profile?.statusCode === 200 ? profile : fallbackProfile;
                setProfileData(resolvedProfile);

                const profileStreak = resolvedProfile?.user_info?.streak || resolvedProfile?.streak || {};
                const profileActiveDates = resolvedProfile?.user_info?.active_dates || resolvedProfile?.active_dates || [];

                const resolvedStreak = streak?.statusCode === 200 ? streak : {
                    current_streak: profileStreak.current_streak || 0,
                    longest_streak: profileStreak.longest_streak || 0,
                    active_dates: profileActiveDates
                };

                const mergedActiveDates = (resolvedStreak.active_dates && resolvedStreak.active_dates.length > 0)
                  ? resolvedStreak.active_dates
                  : profileActiveDates;

                setStreakData({
                    current_streak: resolvedStreak.current_streak || profileStreak.current_streak || 0,
                    longest_streak: resolvedStreak.longest_streak || profileStreak.longest_streak || 0,
                    active_dates: mergedActiveDates
                });

                const hour = new Date().getHours();
                if (hour < 12) setGreeting("Good Morning");
                else if (hour < 17) setGreeting("Good Afternoon");
                else setGreeting("Good Evening");
                
                setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            } catch (error) {
                console.error('Error fetching data:', error);
                setProfileData({
                    full_name: "Student",
                    user_type: "free"
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

    const getUserType = () => {
        return profileData?.user_info?.user_type || profileData?.user_type || "free";
    };

    const getPaymentDetails = () => {
        return profileData?.user_info?.payment_details || profileData?.payment_details || {};
    };

    const isPremium = getUserType() === 'premium' && getPaymentDetails()?.status === 'success';

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
            <div className={`profile-container ${isPremium ? 'app-bg-premium' : 'app-bg-free'}`}>
                <div className="profile-content">
                    <GreetingCard 
                        greeting={greeting} 
                        name={profileData?.personal_info?.full_name || profileData?.full_name} 
                        quote={motivationalQuote} 
                    />
                    
                    <div className="profile-dashboard-grid">
                        {isPremium ? (
                            <>
                                <PremiumInfoCard 
                                    plan={getPaymentDetails()?.plan} 
                                    startDate={getPaymentDetails()?.start_date} 
                                />
                                <DaysLeftCard 
                                    expiryDate={getPaymentDetails()?.expiry_date}
                                />
                            </>
                        ) : (
                            <FreeVsPremiumCard onUpgrade={() => navigate("/payment-plans")} />
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
        </>
    );
}

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
        <p className="profile-premium-plan">Plan: {plan?.charAt(0).toUpperCase() + plan?.slice(1) || 'Premium'}</p>
        <p className="profile-premium-date">Started: {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</p>
    </div>
);

const DaysLeftCard = ({ expiryDate }) => {
    const calculateDaysLeft = (expiry) => {
        if (!expiry) return 0;
        const today = new Date();
        const expiryDateObj = new Date(expiry);
        const diffTime = expiryDateObj - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };
    
    const daysLeft = calculateDaysLeft(expiryDate);
    
    return (
        <div className="profile-days-left-card">
            <h3>Days Left</h3>
            <div className="profile-days-number">{daysLeft}</div>
            <p className="profile-expiry-date">Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p>
        </div>
    );
};

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
            <button className="profile-action-btn" onClick={() => navigate('/practice')}>
                <div className="profile-action-icon">🗣️</div>
                <div className="profile-action-text">
                    <div className="profile-action-title">Start Communication Practice Now</div>
                    <div className="profile-action-desc">Daily practices makes you perfect</div>
                </div>
            </button>
            <button className="profile-action-btn" onClick={() => navigate('/interview')}>
                <div className="profile-action-icon">I</div>
                <div className="profile-action-text">
                    <div className="profile-action-title">Start Interview with Tara AI Now</div>
                    <div className="profile-action-desc">practice level by level interview module</div>
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

export default ProfileData;