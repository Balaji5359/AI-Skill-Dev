import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../RegisterFiles/login.css';
import { profileAPI, platformAPI } from '../services/api';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userType, setUserType] = useState('free');
    const [streakData, setStreakData] = useState({ current_streak: 0 });
    const [profileData, setProfileData] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedEmail = localStorage.getItem('email');
                if (!storedEmail) return;

                const [profile, streak] = await Promise.all([
                    profileAPI.get(storedEmail),
                    platformAPI.updateStreak(storedEmail, true)
                ]);

                if (profile?.statusCode === 200) {
                    setProfileData(profile);
                    const computedUserType = profile?.user_type === 'premium' && profile?.premium_status === 'active' ? 'premium' : 'free';
                    setUserType(computedUserType);
                    localStorage.setItem('user_type', computedUserType);
                    const profStreak = profile.streak || {};
                    const streakObj = {
                        current_streak: profStreak.current_streak || streak?.current_streak || 0,
                        longest_streak: profStreak.longest_streak || streak?.longest_streak || 0,
                        active_dates: profStreak.active_dates || streak?.active_dates || []
                    };
                    setStreakData(streakObj);
                    localStorage.setItem('streak_current', String(streakObj.current_streak));
                    localStorage.setItem('streak_longest', String(streakObj.longest_streak || 0));
                    localStorage.setItem('active_dates', JSON.stringify(streakObj.active_dates || []));
                } else if (streak?.statusCode === 200) {
                    setStreakData(streak);
                    localStorage.setItem('streak_current', String(streak.current_streak || 0));
                    localStorage.setItem('streak_longest', String(streak.longest_streak || 0));
                    localStorage.setItem('active_dates', JSON.stringify(streak.active_dates || []));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const email = profileData?.college_email || localStorage.getItem('email') || 'User';

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <header className="header glass border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="header-content">
                <div className="header-left">
                    <div className="logo">
                        <span className="logo-text">Skill Route</span>
                    </div>
                    <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                        <button
                            onClick={() => {
                                navigate("/profiledata");
                                setMobileMenuOpen(false);
                            }}
                            className={`nav-link ${isActive("/profiledata") ? 'active' : ''}`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => {
                                navigate("/test");
                                setMobileMenuOpen(false);
                            }}
                            className={`nav-link ${isActive("/test") ? 'active' : ''}`}
                        >
                            Tests
                        </button>
                        <button
                            onClick={() => {
                                navigate("/practice");
                                setMobileMenuOpen(false);
                            }}
                            className={`nav-link ${isActive("/practice") ? 'active' : ''}`}
                        >
                            Practices
                        </button>
                        <button
                            onClick={() => {
                                navigate("/interview");
                                setMobileMenuOpen(false);
                            }}
                            className={`nav-link ${isActive("/interview") ? 'active' : ''}`}
                        >
                            Interview Hub
                        </button>
                        <button
                            onClick={() => {
                                navigate("/student-dashboard");
                                setMobileMenuOpen(false);
                            }}
                            className={`nav-link ${isActive("/student-dashboard") ? 'active' : ''}`}
                        >
                            Dashboard
                        </button>
                        {mobileMenuOpen && (
                        <button
                            onClick={() => {
                                localStorage.removeItem('email');
                                localStorage.removeItem('user_type');
                                localStorage.removeItem('streak_current');
                                localStorage.removeItem('streak_longest');
                                localStorage.removeItem('active_dates');
                                navigate('/signup');
                                setMobileMenuOpen(false);
                            }}
                            className="btn-logout mobile-only"
                        >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
                <div className="header-right">
                    <span className="badge primary">🔥 {streakData.current_streak || 0}</span>
                    <span className={`badge ${userType === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                        {userType === 'premium' ? '👑 Premium' : '🆓 Free'}
                    </span>
                    <span className="badge">{email}</span>
                    <button 
                        className="btn-logout"
                        onClick={() => {
                            localStorage.removeItem('email');
                            localStorage.removeItem('user_type');
                            localStorage.removeItem('streak_current');
                            localStorage.removeItem('streak_longest');
                            localStorage.removeItem('active_dates');
                            navigate('/signup');
                        }}
                    >
                        Logout
                    </button>
                </div>
                <button 
                    className="menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </header>
    );
}

export default Header;
