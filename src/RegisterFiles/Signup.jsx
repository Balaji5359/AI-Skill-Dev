import React, { useState, useEffect } from "react";
import "./login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { authAPI, platformAPI } from "../services/api";

function SignUp() {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.state?.showLogin || true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        collegeName: ''
    });
    const [collegeOptions, setCollegeOptions] = useState({});
    const [collegeOptionsLoading, setCollegeOptionsLoading] = useState(true);
    const [collegeOptionsError, setCollegeOptionsError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState("");
    const [error, setError] = useState("");
    const [showErrorCard, setShowErrorCard] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const [passwordChecks, setPasswordChecks] = useState({
        minLength: false,
        hasCapital: false,
        hasNumber: false,
        hasSpecial: false
    });
    const navigate = useNavigate();

    const validatePassword = (pwd) => {
        return {
            minLength: pwd.length >= 8,
            hasCapital: /[A-Z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
        };
    };

    const isPasswordValid = () => {
        return Object.values(passwordChecks).every(check => check);
    };

    useEffect(() => {
        document.body.style = "";
        document.body.classList.add("auth-page");
        
        // Set login mode if coming from profile creation
        if (location.state?.showLogin) {
            setIsLogin(true);
        }
        
        return () => {
            document.body.classList.remove("auth-page");
        };
    }, [location.state]);

    useEffect(() => {
        let isActive = true;

        const loadCollegeOptions = async () => {
            const result = await platformAPI.getAcademicOptions();
            if (!isActive) return;

            if (result.statusCode === 200 && result.colleges && Object.keys(result.colleges).length > 0) {
                setCollegeOptions(result.colleges);
                setCollegeOptionsError('');
            } else {
                setCollegeOptions({});
                setCollegeOptionsError('Could not load the college list. Please refresh and try again.');
            }
            setCollegeOptionsLoading(false);
        };

        loadCollegeOptions();
        return () => {
            isActive = false;
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Check password requirements in real-time
        if (name === 'password') {
            setPasswordChecks(validatePassword(value));
            setShowPasswordRules(value.length > 0);
        }
        
        // Check password confirmation in real-time
        if (name === 'confirmPassword' || name === 'password') {
            const password = name === 'password' ? value : formData.password;
            const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
            setPasswordMismatch(password !== confirmPassword && confirmPassword !== '');
        }
    };

    const handleInputFocus = () => {
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setApiMessage("");

        if (isLogin) {
            const expectedDomain = collegeOptions[formData.collegeName];
            if (!expectedDomain || !formData.email.toLowerCase().endsWith(`@${String(expectedDomain).toLowerCase()}`)) {
                setErrorMessage("Selected college and email domain do not match");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            // Login API call using updated backend structure
            try {
                const data = await authAPI.login(
                    formData.email,
                    formData.password,
                    formData.collegeName
                );
                
                const errorMsg = data.message || "Login failed";
                setStatusCode(data.statusCode);
                setApiMessage(errorMsg);

                if (data.statusCode === 200) {
                    localStorage.setItem("email", formData.email);
                    setShowErrorCard(false);
                    setApiMessage(errorMsg || "Logged in successfully! Redirecting...");
                    setTimeout(() => {
                        navigate("/profiledata");
                    }, 1500);
                } else {
                    setErrorMessage(errorMsg);
                    setShowErrorCard(true);
                }
            } catch (error) {
                console.error('Login API Error:', error);
                setErrorMessage("Network error. Please check your connection.");
                setShowErrorCard(true);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Validate all required fields for signup
            if (!formData.name.trim()) {
                setErrorMessage("Please enter your full name");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            // Validate email format for signup
            if (!formData.email.trim()) {
                setErrorMessage("Please enter your college email");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            // Validate password requirements
            if (!isPasswordValid()) {
                setErrorMessage("Password must have: 8+ chars, capital letter, number, and special character (!@#$%^&*)");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            // Checking password confirmation
            if (formData.password !== formData.confirmPassword) {
                setErrorMessage("Passwords do not match.");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }
            
            // Validate college selection
            if (!formData.collegeName) {
                setErrorMessage("Please select your college");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            const expectedDomain = collegeOptions[formData.collegeName];
            if (!expectedDomain) {
                setErrorMessage("The selected college is not available. Please refresh and try again.");
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            if (!formData.email.toLowerCase().endsWith(`@${expectedDomain.toLowerCase()}`)) {
                setErrorMessage(`Please use your ${formData.collegeName} email (@${expectedDomain})`);
                setShowErrorCard(true);
                setIsLoading(false);
                return;
            }

            // Signup API call using updated backend structure
            try {
                const data = await authAPI.signup(
                    formData.email,
                    formData.name,
                    formData.password,
                    formData.collegeName
                );
                
                const errorMsg = data.message || "Signup failed";
                setStatusCode(data.statusCode);
                setApiMessage(errorMsg);
                
                if (data.statusCode === 200 || data.statusCode === 201) {
                    localStorage.setItem("email", formData.email);
                    localStorage.setItem("fullName", formData.name);
                    localStorage.setItem("collegeName", formData.collegeName);
                    setShowErrorCard(false);
                    setApiMessage(errorMsg || "Account created successfully! Redirecting...");
                    setTimeout(() => {
                        navigate("/profile-creation-survey");
                    }, 1500);
                } else {
                    setErrorMessage(errorMsg);
                    setShowErrorCard(true);
                }
            } catch (error) {
                console.error('Signup API Error:', error);
                setErrorMessage("Network error. Please check your connection.");
                setShowErrorCard(true);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-layout ${showForm ? 'form-focused' : ''}`}>
                {/* Welcome Section - Desktop Only */}
                <div className="welcome-section">
                    <div className="welcome-content">
                        <h1>Welcome to Skill Route!</h1>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Ready to level up your communication skills?</h2>
                        <p>Create your account now and transform the way you present yourself to the world.</p>
                        <div className="cta-buttons">
                            <button className="btn-outline">Watch Demo</button>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="form-section">
                    <div className="form-container">
                        <div className="brand-header">
                            <h2>{isLogin ? 'Welcome Back' : 'Welcome to Skill Route'}</h2>
                            <p>{isLogin ? 'Sign in to continue' : 'Register now'}</p>
                        </div>


                        <div className="form-tabs">
                            <button
                                className={!isLogin ? 'tab active' : 'tab'}
                                onClick={() => {
                                    setIsLogin(false);
                                    setShowErrorCard(false);
                                    setErrorMessage("");
                                    setApiMessage("");
                                }}
                                type="button"
                            >
                                Sign Up
                            </button>
                        
                            <button
                                className={isLogin ? 'tab active' : 'tab'}
                                onClick={() => {
                                    setIsLogin(true);
                                    setShowErrorCard(false);
                                    setErrorMessage("");
                                    setApiMessage("");
                                }}
                                type="button"
                            >
                                Login
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="input-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    placeholder="Enter College Email"
                                    required
                                />
                            </div>

                            

                            <div className="input-group password-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>

                            {showPasswordRules && !isLogin && (
                                <div className="password-rules">
                                    <div className="rules-header">
                                        <span className="rules-label">Password Requirements</span>
                                    </div>
                                    <div className="rules-list">
                                        <div className={`rule-item ${passwordChecks.minLength ? 'valid' : 'invalid'}`}>
                                            {passwordChecks.minLength ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`rule-item ${passwordChecks.hasCapital ? 'valid' : 'invalid'}`}>
                                            {passwordChecks.hasCapital ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            <span>One capital letter (A-Z)</span>
                                        </div>
                                        <div className={`rule-item ${passwordChecks.hasNumber ? 'valid' : 'invalid'}`}>
                                            {passwordChecks.hasNumber ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            <span>One number (0-9)</span>
                                        </div>
                                        <div className={`rule-item ${passwordChecks.hasSpecial ? 'valid' : 'invalid'}`}>
                                            {passwordChecks.hasSpecial ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            <span>One special character (!@#$%^&*)</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="input-group password-group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        onFocus={handleInputFocus}
                                        placeholder="Confirm Password"
                                        required
                                    />
                                    {passwordMismatch && (
                                        <div className="error-text">Passwords do not match</div>
                                    )}
                                    {formData.confirmPassword && !passwordMismatch && (
                                        <div className="success-text">Passwords match ✓</div>
                                    )}
                                </div>
                            )}
                            
                            <div className="input-group">
                                <select
                                    name="collegeName"
                                    value={formData.collegeName}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    required
                                    className="college-select"
                                    disabled={collegeOptionsLoading || Object.keys(collegeOptions).length === 0}
                                >
                                    <option value="">
                                        {collegeOptionsLoading ? 'Loading colleges...' : 'Select College'}
                                    </option>
                                    {Object.keys(collegeOptions).map((college) => (
                                        <option key={college} value={college}>{college}</option>
                                    ))}
                                </select>
                                {collegeOptionsError && <div className="error-text">{collegeOptionsError}</div>}
                            </div>


                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? 'Login' : 'Sign Up')}
                            </button>
                        </form>

                        {showErrorCard && errorMessage && (
                            <div className="message error-card">
                                <div className="error-content">
                                    <p className="error-message">{errorMessage}</p>
                                </div>
                                <button 
                                    type="button" 
                                    className="error-close"
                                    onClick={() => setShowErrorCard(false)}
                                >
                                </button>
                            </div>
                        )}

                        {apiMessage && !showErrorCard && (
                            <div className="message success-card">
                                <div className="success-icon">✓</div>
                                <p>{apiMessage}</p>
                            </div>
                        )}
                        
                        {/* switch controls placed inside the card and centered */}
                        <div className="switch-in-card">
                            {!isLogin && (
                                <p className="switch-text">
                                    Already have an account? <button type="button" onClick={() => setIsLogin(true)} className="link-btn">Log in</button>
                                </p>
                            )}
                            {isLogin && (
                                <p className="switch-text">
                                    Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="link-btn">Sign up</button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;