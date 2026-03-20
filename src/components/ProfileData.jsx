import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { profileAPI, platformAPI } from "../services/api";
import "./profile.css";

function ProfileData() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [paymentSuccessFlag, setPaymentSuccessFlag] = useState(false);

  const quotes = [
    "The limits of my language mean the limits of my world. - Ludwig Wittgenstein",
    "To have another language is to possess a second soul. - Charlemagne",
    "Language is the road map of a culture. - Rita Mae Brown",
    "Communication is the most important skill you can develop. - Warren Buffett",
    "The art of communication is the language of leadership. - James Humes",
  ];

  useEffect(() => {
    const storedPaymentSuccess = sessionStorage.getItem("payment_success") === "true";
    console.log("[profile-data:payment-flag-check]", {
      routeState: location.state,
      storedPaymentSuccess,
      currentPath: window.location.pathname,
    });
    if (storedPaymentSuccess) {
      setPaymentSuccessFlag(true);
      sessionStorage.removeItem("payment_success");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedEmail = localStorage.getItem("email");

        const [profile, streak] = await Promise.all([
          profileAPI.get(storedEmail).catch(() => ({ statusCode: 400 })),
          platformAPI.updateStreak(storedEmail, true).catch(() => ({ statusCode: 400 })),
        ]);

        const fallbackProfile = {
          full_name: "Student",
          user_type: "free",
          college_email: storedEmail,
        };

        const resolvedProfile = profile?.statusCode === 200 ? profile : fallbackProfile;
        setProfileData(resolvedProfile);

        const resolvedUserType = resolvedProfile?.user_info?.user_type || resolvedProfile?.user_type || "free";
        localStorage.setItem("user_type", resolvedUserType);

        const profileStreak = resolvedProfile?.user_info?.streak || resolvedProfile?.streak || {};
        const profileActiveDates = resolvedProfile?.user_info?.active_dates || resolvedProfile?.active_dates || [];

        const resolvedStreak =
          streak?.statusCode === 200
            ? streak
            : {
                current_streak: profileStreak.current_streak || 0,
                longest_streak: profileStreak.longest_streak || 0,
                active_dates: profileActiveDates,
              };

        const mergedActiveDates =
          resolvedStreak.active_dates && resolvedStreak.active_dates.length > 0
            ? resolvedStreak.active_dates
            : profileActiveDates;

        const currentStreak = resolvedStreak.current_streak || profileStreak.current_streak || 0;
        const longestStreak = resolvedStreak.longest_streak || profileStreak.longest_streak || 0;

        setStreakData({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          active_dates: mergedActiveDates,
        });

        localStorage.setItem("streak_current", String(currentStreak));
        localStorage.setItem("streak_longest", String(longestStreak));

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProfileData({
          full_name: "Student",
          user_type: "free",
        });
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          active_dates: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserType = () => profileData?.user_info?.user_type || profileData?.user_type || "free";
  const getPaymentDetails = () => profileData?.user_info?.payment_details || profileData?.payment_details || {};
  const isPremium = getUserType() === "premium" && getPaymentDetails()?.status === "success";
  const showPaymentSuccess = Boolean((location.state?.paymentSuccess || paymentSuccessFlag) && isPremium);
  const studentName = profileData?.personal_info?.full_name || profileData?.full_name || "Student";

  useEffect(() => {
    if (!loading) {
      console.log("[profile-data:resolved-state]", {
        isPremium,
        showPaymentSuccess,
        userType: getUserType(),
        paymentDetails: getPaymentDetails(),
        currentPath: window.location.pathname,
      });
    }
  }, [loading, isPremium, showPaymentSuccess]);

  useEffect(() => {
    if (showPaymentSuccess) {
      const timer = window.setTimeout(() => {
        const banner = document.getElementById("profile-payment-success");
        banner?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [showPaymentSuccess]);

  if (loading) {
    return (
      <div className="app-loading-container app-bg-free">
        <div className="app-loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className={`profile-container ${isPremium ? "app-bg-premium" : "app-bg-free"}`}>
        <div className="profile-content">
          {showPaymentSuccess ? <SuccessBanner /> : null}

          <GreetingHero
            greeting={greeting}
            name={studentName}
            quote={motivationalQuote}
            isPremium={isPremium}
            plan={getPaymentDetails()?.plan}
          />

          <div className="profile-dashboard-grid">
            <MembershipCard
              isPremium={isPremium}
              paymentDetails={getPaymentDetails()}
              onUpgrade={() => navigate("/payment-plans#pp-duration-section")}
            />
            <StreakCard
              currentStreak={streakData?.current_streak}
              longestStreak={streakData?.longest_streak}
              isPremium={isPremium}
            />
            <AccessCard isPremium={isPremium} onUpgrade={() => navigate("/payment-plans#pp-duration-section")} />
          </div>

          <div className="profile-dashboard-bottom">
            <ActivityCalendar
              activeDates={streakData?.active_dates}
              currentDate={currentCalendarDate}
              onDateChange={setCurrentCalendarDate}
            />
            <QuickActions navigate={navigate} isPremium={isPremium} />
          </div>
        </div>
      </div>
    </>
  );
}

const SuccessBanner = () => (
  <section className="profile-success-banner" id="profile-payment-success">
    <div>
      <p className="profile-success-kicker">Payment Successful</p>
      <h2>Premium is now active on your account.</h2>
      <span>Your profile, access, and daily premium experience are ready.</span>
    </div>
  </section>
);

const GreetingHero = ({ greeting, name, quote, isPremium, plan }) => (
  <section className={`profile-greeting-card ${isPremium ? "profile-greeting-card-premium" : ""}`}>
    <div className="profile-greeting-main">
      <div>
        <div className="profile-user-pill">{isPremium ? "Premium Member" : "Free Plan"}</div>
        <h1 className="profile-greeting-title">
          {greeting}, {name}!
        </h1>
        <p className="profile-motivational-quote">"{quote}"</p>
      </div>
      <div className="profile-hero-metrics">
        <div className="profile-hero-chip">
          <strong>{isPremium ? plan?.toUpperCase() || "PREMIUM" : "FREE"}</strong>
          <span>Current plan</span>
        </div>
        <div className="profile-hero-chip">
          <strong>{isPremium ? "Unlocked" : "Starter"}</strong>
          <span>Learning mode</span>
        </div>
      </div>
    </div>
  </section>
);

const MembershipCard = ({ isPremium, paymentDetails, onUpgrade }) => {
  const planName = paymentDetails?.plan ? paymentDetails.plan.charAt(0).toUpperCase() + paymentDetails.plan.slice(1) : "Premium";
  const startDate = paymentDetails?.start_date ? new Date(paymentDetails.start_date).toLocaleDateString() : "N/A";
  const expiryDate = paymentDetails?.expiry_date ? new Date(paymentDetails.expiry_date).toLocaleDateString() : "N/A";

  if (isPremium) {
    return (
      <section className="profile-status-card profile-status-card-premium">
        <div className="profile-status-head">
          <div>
            <p className="profile-card-kicker">Membership</p>
            <h3>{planName} Premium</h3>
          </div>
          <span className="profile-status-badge">Active</span>
        </div>
        <div className="profile-status-grid">
          <div>
            <strong>Started</strong>
            <span style={{color:"black"}}>{startDate}</span>
          </div>
          <div>
            <strong>Expires</strong>
            <span style={{color:"black"}}>{expiryDate}</span>
          </div>
        </div>
        <p className="profile-status-copy">
          You now have access to the richer learning path, premium analytics, and broader daily communication flow.
        </p>
      </section>
    );
  }

  return (
    <section className="profile-status-card profile-status-card-upgrade">
      <div className="profile-status-head">
        <div>
          <p className="profile-card-kicker">Upgrade Path</p>
          <h3>Turn your profile into a premium progress hub.</h3>
        </div>
        <span className="profile-status-badge profile-status-badge-muted">Free</span>
      </div>
      <p className="profile-status-copy">
        Unlock all levels, better AI analysis, and a cleaner daily growth experience designed for consistent speaking improvement.
      </p>
      <div className="profile-upgrade-points">
        <span>All levels access</span>
        <span>Advanced analytics</span>
        <span>Audio and transcript insights</span>
      </div>
      <div className="profile-membership-actions">
        <button className="profile-upgrade-btn" onClick={onUpgrade}>
          View Premium Plans
        </button>
      </div>
    </section>
  );
};

const StreakCard = ({ currentStreak, longestStreak, isPremium }) => (
  <section className="profile-streak-card">
    <div className="profile-card-head-inline">
      <div>
        <p className="profile-card-kicker">Consistency</p>
        <h3>Daily Streak</h3>
      </div>
      <span className={`profile-status-badge ${isPremium ? "" : "profile-status-badge-muted"}`}>
        {isPremium ? "Premium" : "Growing"}
      </span>
    </div>
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
    <p className="profile-card-footnote">Confidence is not built in a day, it is built daily.</p>
  </section>
);

const AccessCard = ({ isPremium, onUpgrade }) => (
  <section className="profile-access-card">
    <div className="profile-card-head-inline">
      <div>
        <p className="profile-card-kicker">Access Snapshot</p>
        <h3>{isPremium ? "Your premium toolkit is active." : "You are on the starter path."}</h3>
      </div>
    </div>
    <div className="profile-access-list">
      {(isPremium
        ? ["All communication levels", "Premium analytics dashboards", "Detailed session review"]
        : ["Basic-level access", "Starter AI feedback", "Upgrade path available now"]
      ).map((item) => (
        <div key={item} className="profile-access-item">
          {item}
        </div>
      ))}
    </div>
    {!isPremium ? (
      <button className="profile-outline-btn" onClick={onUpgrade}>
        Upgrade from Profile
      </button>
    ) : null}
  </section>
);

const ActivityCalendar = ({ activeDates, currentDate, onDateChange }) => {
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const activeDaysCount =
    activeDates?.filter((dateStr) => {
      const date = new Date(dateStr);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length || 0;

  const navigateMonth = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    if (direction > 0 && newDate > today) return;
    onDateChange(newDate);
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    return nextMonth <= today;
  };

  const calendarDays = [];

  for (let i = 0; i < startingDayOfWeek; i += 1) {
    calendarDays.push(<div key={`empty-${i}`} className="profile-calendar-day empty" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isActive = activeDates?.includes(dateStr);
    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    calendarDays.push(
      <div
        key={day}
        className={`profile-calendar-day ${isActive ? "active" : ""} ${isToday ? "today" : ""}`}
        title={`${monthName} ${day}${isActive ? " - Active" : ""}`}
      >
        {day}
      </div>
    );
  }

  return (
    <section className="profile-activity-calendar">
      <div className="profile-calendar-header">
        <div>
          <p className="profile-card-kicker">Attendance</p>
          <h3>Activity Calendar</h3>
        </div>
        <div className="profile-calendar-navigation">
          <button className="profile-nav-btn" onClick={() => navigateMonth(-1)} title="Previous month">
            <span className="profile-nav-btn-arrow">&lt;</span>
            <span className="profile-nav-btn-text">Prev</span>
          </button>
          <div className="profile-calendar-stats">
            <span className="profile-month-name">{monthName}</span>
            <span className="profile-active-count">{activeDaysCount} active days</span>
          </div>
          <button
            className={`profile-nav-btn ${!canNavigateNext() ? "disabled" : ""}`}
            onClick={() => navigateMonth(1)}
            disabled={!canNavigateNext()}
            title="Next month"
          >
            <span className="profile-nav-btn-text">Next</span>
            <span className="profile-nav-btn-arrow">&gt;</span>
          </button>
        </div>
      </div>

      <div className="profile-calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="profile-weekday-label">
            {day}
          </div>
        ))}
      </div>

      <div className="profile-calendar-grid-month">{calendarDays}</div>
    </section>
  );
};

const QuickActions = ({ navigate, isPremium }) => (
  <section className="profile-quick-actions">
    <div className="profile-card-head-inline">
      <div>
        <p className="profile-card-kicker">Next Step</p>
        <h3>Quick Actions</h3>
      </div>
      <span className={`profile-status-badge ${isPremium ? "" : "profile-status-badge-muted"}`}>
        {isPremium ? "Unlocked" : "Starter"}
      </span>
    </div>
    <div className="profile-actions-grid">
      <button className="profile-action-btn" onClick={() => navigate("/test")}>
        <div className="profile-action-icon">T</div>
        <div className="profile-action-text">
          <div className="profile-action-title">Start Communication Test</div>
          <div className="profile-action-desc">Measure your present communication performance.</div>
        </div>
      </button>
      <button className="profile-action-btn" onClick={() => navigate("/practice")}>
        <div className="profile-action-icon">P</div>
        <div className="profile-action-text">
          <div className="profile-action-title">Continue Practice</div>
          <div className="profile-action-desc">Build daily speaking confidence with guided practice.</div>
        </div>
      </button>
      <button className="profile-action-btn" onClick={() => navigate("/interview")}>
        <div className="profile-action-icon">I</div>
        <div className="profile-action-text">
          <div className="profile-action-title">Enter Interview Module</div>
          <div className="profile-action-desc">Train with Tara AI across structured interview flows.</div>
        </div>
      </button>
      <button className="profile-action-btn" onClick={() => navigate("/student-dashboard")}>
        <div className="profile-action-icon">A</div>
        <div className="profile-action-text">
          <div className="profile-action-title">View Analytics</div>
          <div className="profile-action-desc">Review scores, AI feedback, and communication trends.</div>
        </div>
      </button>
    </div>
  </section>
);

export default ProfileData;
