import React, { useEffect, useState } from "react";
import './ai_skill_dev.css';
import ai_skill_dev_logo from "../assets/AI_Skill_Dev_logo.png";
import { useNavigate } from "react-router-dom";
function AI_Skill_Dev() {
    const [scrolled, setScrolled] = useState(false);
    const [activeCard, setActiveCard] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
        icon: "🚀",
        title: "AI-Agents",
        description: "Personalized learning paths powered by artificial intelligence"
        },
        {
        icon: "💡",
        title: "Smart Solutions",
        description: "Innovative approaches to complex problem-solving"
        },
        {
        icon: "🎯",
        title: "Goal-Oriented",
        description: "Focused training to achieve your career objectives"
        },
        {
        icon: "🌟",
        title: "Expert Mentorship",
        description: "Learn from industry professionals and AI experts"
        }
    ];
    const products = [
        {
            icon: "1",
            title: "Skill-Guide",
            description: "AI Skill-Dev's AI Agent and AR/VR based product for guiding students in choosing career paths"
        },
        {
            icon: "2",
            title: "Skill-Dev",
            description: "AI Skill-Dev's AI Agent and AI roadmap based product for developing students skills in their career paths"
        },
        {
            icon: "3",
            title: "Skill-Route",
            // on click this Skill-Route Learn more button navigate to /skill-route
            description: "AI Skill-Dev's AI Agent product for routing students communication and interview skills in landing their dream"
        }
    ];

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-content">
                    <div className="logo">
                        <span className="logo-icon">
                            <img
                                src={ai_skill_dev_logo}
                                alt="AI SkillDev Logo"
                                style={{ paddingTop: "1px", width: "80px", height: "80px", borderRadius: "50%" }}
                            />
                        </span>
                        <span className="logo-text">AI SkillDev</span>
                    </div>
                    <div className="nav-links">
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#programs">Our Products</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <button className="cta-button">Institute Register</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        We <span className="gradient-text">AI SkillDev</span> <br />for the Future
                        <br />
                        <p className="hero-subtitle">Develop you skills with AI and VR Experience</p>
                    </h1>
                    <p className="hero-subtitle">
                        Transform your Computer Science career with the cutting-edge of AI education.<br />
                        Learn from <span className="gradient-text">AI Agents</span>, Explore from <span className="gradient-text">AR and VR</span><br />
                        Choose your career path<br />
                        Work consistently on AI roadmap<br />
                        Build real-world projects<br />
                        Practice Communication and Interviews with AI Agents<br />
                        Land your dream job in your chosen domain.<br />
                    </p>
                    <div className="hero-buttons">
                        <button className="primary-button">Institute Registration</button>
                        <button className="secondary-button">Watch Demo</button>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="image-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                        <img
                            src="https://tse2.mm.bing.net/th/id/OIP.8X4eF6M_OTAWrR9dpuyiPAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
                            alt="AI Learning"
                            style={{ width: "100%", maxWidth: "500px", height: "auto", display: "block", borderRadius: "12px" }}
                        />
                        <img
                            src="https://img.freepik.com/premium-photo/futuristic-classroom-with-students-using-vr-headsets-learning-use-virtual-reality-education-transforms-learning-experience-making-it-immersive-interactive_86390-31628.jpg"
                            alt="AR VR"
                            style={{ width: "100%", maxWidth: "500px", height: "auto", display: "block", borderRadius: "12px" }}
                        />
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="programs" className="programs-section">
                <div className="container">
                    <h2 className="section-title">About US</h2>
                    <div className="programs-grid">
                        {products.map((product, index) => (
                            <div
                                key={index}
                                className="program-card"
                                style={{
                                    background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)",
                                    borderRadius: "18px",
                                    boxShadow: "0 4px 24px rgba(80, 80, 180, 0.10)",
                                    transition: "transform 0.3s, box-shadow 0.3s, background 0.3s",
                                    cursor: "pointer",
                                    border: "2px solid #e0e7ff",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-10px) scale(1.04)";
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(80, 80, 180, 0.18)";
                                    e.currentTarget.style.background = "linear-gradient(135deg, #e0e7ff 60%, #f8fafc 100%)";
                                    e.currentTarget.style.border = "2px solid #6366f1";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(80, 80, 180, 0.10)";
                                    e.currentTarget.style.background = "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)";
                                    e.currentTarget.style.border = "2px solid #e0e7ff";
                                }}
                            >
                                <div style={{
                                    fontSize: "2.5rem",
                                    marginBottom: "10px",
                                    color: "#6366f1",
                                    background: "#eef2ff",
                                    borderRadius: "50%",
                                    width: "56px",
                                    height: "56px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px auto"
                                }}>
                                    {product.icon}
                                </div>
                                <h3 style={{ color: "#3730a3", marginBottom: "8px" }}>{product.title}</h3>
                                <p style={{ color: "#334155", marginBottom: "18px", minHeight: "60px" }}>{product.description}</p>
                                <button
                                    className="program-button"
                                    style={{
                                        background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "10px 24px",
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                        marginTop: "10px",
                                        boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(90deg, #818cf8 0%, #6366f1 100%)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"}
                                >
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose AI SkillDev?</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`feature-card ${activeCard === index ? 'active' : ''}`}
                                onMouseEnter={() => setActiveCard(index)}
                                onMouseLeave={() => setActiveCard(null)}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="programs" className="programs-section">
                <div className="container">
                    <h2 className="section-title">Our Products</h2>
                    <div className="programs-grid">
                        {products.map((product, index) => (
                            <div
                                key={index}
                                className="program-card"
                                style={{
                                    background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)",
                                    borderRadius: "18px",
                                    boxShadow: "0 4px 24px rgba(80, 80, 180, 0.10)",
                                    transition: "transform 0.3s, box-shadow 0.3s, background 0.3s",
                                    cursor: "pointer",
                                    border: "2px solid #e0e7ff",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-10px) scale(1.04)";
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(80, 80, 180, 0.18)";
                                    e.currentTarget.style.background = "linear-gradient(135deg, #e0e7ff 60%, #f8fafc 100%)";
                                    e.currentTarget.style.border = "2px solid #6366f1";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(80, 80, 180, 0.10)";
                                    e.currentTarget.style.background = "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)";
                                    e.currentTarget.style.border = "2px solid #e0e7ff";
                                }}
                                onClick={() => {
                                        if (product.title === "Skill-Route") {
                                            window.open("/skill-route", "_blank");
                                        }
                                        if (product.title === "Skill-Guide") {
                                            window.open("/skill-guide", "_blank");
                                        }
                                        if (product.title === "Skill-Dev") {
                                            window.open("/skill-dev", "_blank");
                                        }
                                    }}
                            >
                                <div style={{
                                    fontSize: "2.5rem",
                                    marginBottom: "10px",
                                    color: "#6366f1",
                                    background: "#eef2ff",
                                    borderRadius: "50%",
                                    width: "56px",
                                    height: "56px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px auto"
                                }}>
                                    {product.icon}
                                </div>
                                <h3 style={{ color: "#3730a3", marginBottom: "8px" }}>{product.title}</h3>
                                <p style={{ color: "#334155", marginBottom: "18px", minHeight: "60px" }}>{product.description}</p>
                            <button
                                className="program-button"
                                style={{
                                    background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 24px",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    marginTop: "10px",
                                    boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(90deg, #818cf8 0%, #6366f1 100%)"}
                                onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"}
                            >
                                Learn More
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>


        {/* <section className="stats-section">
            <div className="container">
            <div className="stats-grid">
                <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Students Trained</div>
                </div>
                <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Job Placement Rate</div>
                </div>
                <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Expert Mentors</div>
                </div>
                <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Partner Companies</div>
                </div>
            </div>
            </div>
        </section> */}

        {/* CTA Section */}
        <section className="cta-section">
            <div className="container">
            <h2>Ready to Start Your CS Journey?</h2>
            <p>Join with AI SkillDev to get start learning with AI and VR Experience.</p>
            <button className="cta-large-button">Get Started Today</button>
            </div>
        </section>

        {/* Footer */}
        <footer className="footer">
            <div className="container">
            <div className="footer-content">
                <div className="footer-section">
                <h4>AI SkillDev</h4>
                <p>Empowering the next generation of CS Students through innovative education and hands-on experience.</p>
                </div>
                <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#programs">Programs</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#careers">Careers</a></li>
                </ul>
                </div>
                <div className="footer-section">
                <h4>Our Products</h4>
                <ul>
                    <li><a href="#beginner">Skill Guide</a></li>
                    <li><a href="#professional">Skill Dev</a></li>
                    <li><a href="#expert">Skill Route</a></li>
                    <li><a href="#corporate">and many more in future...</a></li>
                </ul>
                </div>
                <div className="footer-section">
                <h4>Connect</h4>
                <div className="social-links-col">
                    <a href="#" className="social-link" aria-label="LinkedIn">
                        <span style={{fontSize:'1.2rem'}}>📘</span>
                        <span className="social-name">LinkedIn</span>
                    </a>
                    <a href="#" className="social-link" aria-label="YouTube">
                        <span style={{fontSize:'1.2rem'}}>🐦</span>
                        <span className="social-name">YouTube</span>
                    </a>
                    <a href="#" className="social-link" aria-label="Website">
                        <span style={{fontSize:'1.2rem'}}>💼</span>
                        <span className="social-name">Website</span>
                    </a>
                </div>
            </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 AI SkillDev - Startup</p>
            </div>
            </div>
        </footer>
        </div>
    );
}

export default AI_Skill_Dev;